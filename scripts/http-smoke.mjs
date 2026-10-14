const baseUrl = process.env.SMOKE_BASE_URL || "http://127.0.0.1:3000";

async function main() {
  const home = await fetch(baseUrl);
  const html = await home.text();
  const stylesheet = html.match(/href="([^"]+\.css[^"]*)"/);
  if (!stylesheet) throw new Error("Missing compiled stylesheet");

  const css = await fetch(new URL(stylesheet[1], baseUrl));
  const missing = await fetch(new URL("/missing-page", baseUrl));
  const checks = {
    homeStatus: home.status,
    title: html.includes("Coolearn"),
    hero: html.includes("Your pace."),
    developmentNotice: html.includes("In development"),
    sections: ["experience", "how-it-works", "roadmap"].every((id) => html.includes(`id="${id}"`)),
    illustrationDisclosure: html.includes("Learning tools are still in development."),
    cssStatus: css.status,
    notFoundStatus: missing.status,
    notFoundLink: (await missing.text()).includes("Back to home"),
  };

  console.log(JSON.stringify(checks, null, 2));
  if (checks.homeStatus !== 200 || checks.cssStatus !== 200 || checks.notFoundStatus !== 404 || Object.values(checks).some((value) => value === false)) {
    throw new Error("HTTP smoke check failed");
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
