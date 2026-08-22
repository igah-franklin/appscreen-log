/**
 * Layout capture helper.
 *
 * Paste into the browser console on an appscreens.com template detail page.
 * It runs the site's own "Start with Template → Copy Template to Sandbox"
 * flow, reads the resulting sandbox project, normalises it into the shape the
 * API stores, and PUTs it to the local server.
 *
 *   await captureLayout("tRiGP");
 *
 * Decorative artwork is recorded as an asset slot only (id + inferred shape) —
 * the source SVGs stay on AppScreens' servers and are not copied.
 */
window.captureLayout = async function captureLayout(templateId, api = "http://localhost:4000") {
  const wait = (ms) => new Promise((r) => setTimeout(r, ms));

  const inflate = async (b64) => {
    const bytes = Uint8Array.from(atob(b64), (c) => c.charCodeAt(0));
    const stream = new Blob([bytes])
      .stream()
      .pipeThrough(new DecompressionStream("deflate"));
    return JSON.parse(await new Response(stream).text());
  };

  // 1. run the site's copy flow
  const start = [...document.querySelectorAll("app-example button")].find((b) =>
    /Start with Template/.test(b.textContent),
  );
  if (!start) throw new Error("not on a template detail page");
  start.click();
  await wait(1200);

  const rows = [...document.querySelectorAll("project-create li")];
  const toSandbox = rows.find((li) =>
    /Copy Template to Sandbox/.test(li.textContent),
  );
  if (!toSandbox) throw new Error("sandbox option missing");
  toSandbox.click();

  for (let i = 0; i < 40 && !location.pathname.includes("/user/sandbox"); i++) {
    await wait(500);
  }
  await wait(2500);

  // 2. read the project the app just built
  const project = JSON.parse(sessionStorage.getItem("ngx__playground") || "{}");
  if (!project.screenshots?.length) throw new Error("no sandbox project found");

  const text = (t) =>
    (t?.ops || [])
      .map((o) => (typeof o.insert === "string" ? o.insert : ""))
      .join("")
      .replace(/\n+$/, "");
  const attrs = (t) => ((t?.ops || []).find((o) => o.attributes) || {}).attributes || {};

  const shapeOf = (id) => {
    if (!id) return "generic";
    if (/blob|organic|fluid|puddle/i.test(id)) return "blob";
    if (/sparkle|star/i.test(id)) return "sparkle";
    if (/wavy|line|divider|underline/i.test(id)) return "wave";
    return "generic";
  };

  const TYPES = {
    ASElementTitles: "title",
    ASElementImage: "image",
    ASElementDeviceFrame: "device",
    ASElementBlank: "spacer",
  };

  const round = (n) => Number(n.toFixed(4));

  const element = (el) => {
    const out = {
      type: TYPES[el.type] ?? "spacer",
      loc: {
        w: round(el.location.width),
        h: round(el.location.height),
        x: round(el.location.x),
        y: round(el.location.y),
        anchor: el.location.anchor === "topLeft" ? "topLeft" : "middle",
      },
      rot: el.rotation || 0,
    };

    if (el.type === "ASElementTitles") {
      const a = attrs(el.title?.text);
      out.title = {
        text: text(el.title?.text),
        color: a.color && a.color !== "#00000000" ? a.color : el.title?.color,
        gradient: a.gradient || null,
        bold: Boolean(a.bold),
        align: el.title?.fontAlign || "left",
        font: el.title?.fontFamily?.name,
        lineHeight: el.title?.lineHeight ?? 1,
      };
      const sub = text(el.subtitle?.text);
      if (sub) {
        const sa = attrs(el.subtitle?.text);
        out.subtitle = {
          text: sub,
          color: sa.color && sa.color !== "#00000000" ? sa.color : el.subtitle?.color,
          gradient: sa.gradient || null,
          bold: Boolean(sa.bold),
          align: el.subtitle?.fontAlign || "left",
          font: el.subtitle?.fontFamily?.name,
          lineHeight: el.subtitle?.lineHeight ?? 1,
        };
      }
      out.decoration = el.decorationStyle || "none";
    }

    if (el.type === "ASElementImage") {
      out.asset = el.image?.id || null;
      out.assetShape = shapeOf(el.image?.id);
    }

    if (el.type === "ASElementDeviceFrame") {
      out.device = { variant: el.device || "full", colour: el.deviceType || "black" };
    }

    return out;
  };

  const screens = [];
  for (const s of project.screenshots) {
    const layers = await inflate(s.layersc);
    screens.push({
      order: s.order,
      layout: s.layout || "Blank",
      orientation: s.orientation === "landscape" ? "landscape" : "portrait",
      groups: layers.map((group) => group.map(element)),
    });
  }

  const payload = {
    background: project.background,
    primaryColor: project.primaryColor,
    titleFont: project.titleFont?.name,
    subtitleFont: project.subtitleFont?.name,
    targets: Object.entries(project.targets || {})
      .filter(([, on]) => on)
      .map(([k]) => k),
    screens,
  };

  const res = await fetch(`${api}/api/templates/${templateId}/layout`, {
    method: "PUT",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(payload),
  });
  return { templateId, status: res.status, ...(await res.json()) };
};
