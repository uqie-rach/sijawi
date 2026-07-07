` with a minimal `register` function that does nothing.
- `<dyad-write path="scripts/email-worker.ts">` with the standalone worker.
- `<dyad-add-dependency packages="tsx"></dyad-add-dependency>` (if needed)
- `<dyad-write path="package.json">` to update scripts (but careful: we should only add the `worker` script, not overwrite entire package.json. The guidelines say we can update a file with a partial change? We must provide the whole `package.json`? It's risky. The user wants us to add a script, so we can use a targeted update by rewriting the `package.json` file with the new script added. But that would replace the entire file. The template for `dyad-write` expects a full file. I'll output a `<dyad-write path="package.json">` with the entire content including the new script. That's safest.

But I need to be careful to not include sensitive data. The context only shows the package.json earlier, but it's huge. But the user wants to add a script, we can just modify the `scripts` section. To avoid overwriting entire package.json incorrectly, I'll output the complete package.json based on the provided one with the added line. The package.json from the context is large; I'll just copy it and add `"worker": "tsx scripts/email-worker.ts"` to the scripts section.

Given the tools, I'll produce the three writes.

Potential issue: The email-worker script should also handle errors gracefully and keep running. I'll add a catch in case Redis connection fails, etc. Also ensure that `process.env.REDIS_URL` is defined.

I'll output the final answer.</think>We need to decouple the BullMQ worker from Next.js entirely. Let's start by installing `tsx` to run the standalone worker, clean up instrumentation, and create the worker script.

<dyad-add-dependency packages="tsx"></dyad-add-dependency>

Now we apply the changes:

<dyad-write path="src/instrumentation.ts">
// Instrumentasi Next.js: sengaja dikosongkan karena consumer worker BullMQ
// dijalankan sebagai proses terpisah (scripts/email-worker.ts) untuk menghindari
// konflik modul Node.js (crypto, stream) dengan webpack Next.js.

export async function register() {
  // Tidak ada inisialisasi yang diperlukan di sini.
}