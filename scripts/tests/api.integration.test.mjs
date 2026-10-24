import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { once } from "node:events";
import { mkdtemp, rm } from "node:fs/promises";
import net from "node:net";
import os from "node:os";
import path from "node:path";
import test, { after, before } from "node:test";
import { fileURLToPath } from "node:url";

const workspaceRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "../..",
);
const apiDirectory = path.join(workspaceRoot, "artifacts", "api-server");
let temporaryDirectory;
let server;
let baseUrl;
let serverOutput = "";

async function reservePort() {
  const listener = net.createServer();
  listener.listen(0, "127.0.0.1");
  await once(listener, "listening");
  const address = listener.address();
  if (!address || typeof address === "string") {
    throw new Error("Could not reserve an API test port");
  }
  await new Promise((resolve, reject) =>
    listener.close((error) => (error ? reject(error) : resolve())),
  );
  return address.port;
}

before(async () => {
  temporaryDirectory = await mkdtemp(
    path.join(os.tmpdir(), "all-about-iot-api-"),
  );
  const port = await reservePort();
  baseUrl = `http://127.0.0.1:${port}/api`;

  server = spawn(process.execPath, ["./dist/index.mjs"], {
    cwd: apiDirectory,
    env: {
      ...process.env,
      NODE_ENV: "test",
      HOST: "127.0.0.1",
      PORT: String(port),
      DATABASE_PATH: path.join(temporaryDirectory, "test.sqlite"),
      CORS_ORIGIN: "https://allowed.example",
    },
    stdio: ["ignore", "pipe", "pipe"],
  });
  server.stdout.setEncoding("utf8").on("data", (chunk) => {
    serverOutput += chunk;
  });
  server.stderr.setEncoding("utf8").on("data", (chunk) => {
    serverOutput += chunk;
  });

  const deadline = Date.now() + 15_000;
  while (Date.now() < deadline) {
    if (server.exitCode !== null) {
      throw new Error(`API exited before becoming healthy:\n${serverOutput}`);
    }
    try {
      const response = await fetch(`${baseUrl}/healthz`);
      if (response.ok) return;
    } catch {
      await new Promise((resolve) => setTimeout(resolve, 100));
    }
  }

  throw new Error(`API did not become healthy in time:\n${serverOutput}`);
});

after(async () => {
  if (server && server.exitCode === null) {
    server.kill();
    await once(server, "exit");
  }
  if (temporaryDirectory) {
    await rm(temporaryDirectory, { recursive: true, force: true });
  }
});

test("production API serves features, isolates chat, and validates requests", async () => {
  const health = await fetch(`${baseUrl}/healthz`);
  assert.deepEqual(await health.json(), { status: "ok" });
  assert.equal(health.headers.get("x-content-type-options"), "nosniff");

  const conceptsResponse = await fetch(`${baseUrl}/concepts`);
  const concepts = await conceptsResponse.json();
  assert.equal(conceptsResponse.status, 200);
  assert.equal(concepts.length, 10);

  const conceptResponse = await fetch(
    `${baseUrl}/concepts/${concepts[0].slug}`,
  );
  const concept = await conceptResponse.json();
  assert.equal(conceptResponse.status, 200);
  assert.ok(concept.content);
  assert.ok(Array.isArray(concept.keyPoints));

  const questionsResponse = await fetch(`${baseUrl}/quiz?limit=5`);
  const questions = await questionsResponse.json();
  assert.equal(questionsResponse.status, 200);
  assert.equal(questions.length, 5);
  assert.equal((await fetch(`${baseUrl}/quiz?limit=-1`)).status, 400);

  const answerResponse = await fetch(`${baseUrl}/quiz/submit`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ questionId: questions[0].id, selectedOption: 0 }),
  });
  assert.equal(answerResponse.status, 200);
  assert.equal((await answerResponse.json()).correct, true);
  assert.equal(
    (
      await fetch(`${baseUrl}/quiz/submit`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          questionId: questions[0].id,
          selectedOption: 99,
        }),
      })
    ).status,
    400,
  );

  const chatResponse = await fetch(`${baseUrl}/chat`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      message: "What is IoT?",
      sessionId: "integration-session-a",
    }),
  });
  assert.equal(chatResponse.status, 200);

  const streamResponse = await fetch(`${baseUrl}/chat/stream`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      message: "Explain MQTT protocol",
      sessionId: "integration-session-b",
    }),
  });
  assert.equal(streamResponse.status, 200);
  assert.match(
    streamResponse.headers.get("content-type"),
    /text\/event-stream/,
  );
  const streamedChat = await streamResponse.text();
  assert.match(streamedChat, /"done":true/);

  const historyResponse = await fetch(
    `${baseUrl}/chat/history?sessionId=integration-session-a`,
  );
  const history = await historyResponse.json();
  assert.equal(historyResponse.status, 200);
  assert.equal(history.length, 2);
  assert.ok(
    history.every((message) => message.sessionId === "integration-session-a"),
  );
  assert.equal(
    (
      await fetch(
        `${baseUrl}/chat/history?sessionId=integration-session-a&limit=100000`,
      )
    ).status,
    400,
  );

  const deleteResponse = await fetch(
    `${baseUrl}/chat/history?sessionId=integration-session-a`,
    { method: "DELETE" },
  );
  assert.equal(deleteResponse.status, 204);
  assert.deepEqual(
    await (
      await fetch(`${baseUrl}/chat/history?sessionId=integration-session-a`)
    ).json(),
    [],
  );
  assert.equal(
    (await fetch(`${baseUrl}/chat/history?sessionId=integration-session-b`))
      .status,
    200,
  );

  const statsResponse = await fetch(`${baseUrl}/stats`);
  const stats = await statsResponse.json();
  assert.equal(stats.totalConcepts, 10);
  assert.equal(stats.totalQuestionsAnswered, 1);

  const corsResponse = await fetch(`${baseUrl}/healthz`, {
    method: "OPTIONS",
    headers: {
      Origin: "https://allowed.example",
      "Access-Control-Request-Method": "GET",
    },
  });
  assert.equal(
    corsResponse.headers.get("access-control-allow-origin"),
    "https://allowed.example",
  );
});
