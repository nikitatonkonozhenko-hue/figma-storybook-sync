const ALLOWED_STATUSES = new Set(["draft", "active", "archived"]);

function json(res, statusCode, payload) {
  res.statusCode = statusCode;
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.end(JSON.stringify(payload));
}

function getEnvConfig() {
  const url = process.env.SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const table = process.env.PROTOTYPES_TABLE || "prototypes";
  return { url, serviceRoleKey, table };
}

function normalizeHref(href) {
  if (!href) return "";
  const trimmed = String(href).trim();
  if (!trimmed) return "";
  const prefixed = trimmed.startsWith("/") ? trimmed : `/${trimmed}`;
  return prefixed.endsWith("/") ? prefixed : `${prefixed}/`;
}

function normalizeFolder(folder, href) {
  const raw = String(folder || "").trim();
  if (raw) return raw.endsWith("/") ? raw : `${raw}/`;
  return normalizeHref(href).replace(/^\//, "");
}

function toSlug(href, name) {
  const byHref = normalizeHref(href).replace(/^\/|\/$/g, "");
  if (byHref) return byHref;
  return String(name || "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

async function supabaseRequest(config, query = "", init = {}) {
  const endpoint = `${config.url}/rest/v1/${config.table}${query}`;
  const response = await fetch(endpoint, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      apikey: config.serviceRoleKey,
      Authorization: `Bearer ${config.serviceRoleKey}`,
      ...(init.headers || {}),
    },
  });
  return response;
}

module.exports = async (req, res) => {
  const config = getEnvConfig();
  if (!config.url || !config.serviceRoleKey) {
    return json(res, 503, {
      error: "Supabase is not configured. Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.",
    });
  }

  if (req.method === "GET") {
    try {
      const response = await supabaseRequest(
        config,
        "?select=id,name,slug,status,folder,href,notes,created_at,created_by&order=created_at.desc"
      );
      const body = await response.text();
      if (!response.ok) return json(res, response.status, { error: body || "Failed to fetch prototypes." });
      return json(res, 200, { items: JSON.parse(body) });
    } catch (error) {
      return json(res, 500, { error: error.message || "Unexpected error while reading prototypes." });
    }
  }

  if (req.method === "POST") {
    try {
      const payload = typeof req.body === "string" ? JSON.parse(req.body || "{}") : req.body || {};
      const name = String(payload.name || "").trim();
      if (!name) return json(res, 400, { error: "Field 'name' is required." });

      const href = normalizeHref(payload.href || "");
      if (!href) return json(res, 400, { error: "Field 'href' is required." });

      const status = String(payload.status || "draft").toLowerCase();
      if (!ALLOWED_STATUSES.has(status)) {
        return json(res, 400, { error: "Invalid status. Allowed: draft, active, archived." });
      }

      const record = {
        name,
        status,
        href,
        folder: normalizeFolder(payload.folder, href),
        notes: String(payload.notes || "").trim(),
        slug: toSlug(href, name),
        created_by: String(payload.createdBy || "dashboard"),
      };

      const response = await supabaseRequest(config, "", {
        method: "POST",
        headers: { Prefer: "return=representation" },
        body: JSON.stringify(record),
      });
      const body = await response.text();

      if (!response.ok) {
        return json(res, response.status, {
          error: body || "Failed to create prototype.",
        });
      }

      const inserted = JSON.parse(body);
      return json(res, 201, { item: inserted?.[0] || record });
    } catch (error) {
      return json(res, 500, { error: error.message || "Unexpected error while creating prototype." });
    }
  }

  if (req.method === "PATCH") {
    try {
      const payload = typeof req.body === "string" ? JSON.parse(req.body || "{}") : req.body || {};
      const id = String(payload.id || "").trim();
      if (!id) return json(res, 400, { error: "Field 'id' is required for PATCH." });

      const updates = {};

      if (payload.name !== undefined) {
        const name = String(payload.name || "").trim();
        if (!name) return json(res, 400, { error: "Field 'name' cannot be empty." });
        updates.name = name;
      }

      if (payload.status !== undefined) {
        const status = String(payload.status || "").toLowerCase();
        if (!ALLOWED_STATUSES.has(status)) {
          return json(res, 400, { error: "Invalid status. Allowed: draft, active, archived." });
        }
        updates.status = status;
      }

      if (payload.href !== undefined) {
        const href = normalizeHref(payload.href || "");
        if (!href) return json(res, 400, { error: "Field 'href' cannot be empty." });
        updates.href = href;
        updates.slug = toSlug(href, payload.name);
      }

      if (payload.folder !== undefined || payload.href !== undefined) {
        updates.folder = normalizeFolder(payload.folder, updates.href || payload.href || "");
      }

      if (payload.notes !== undefined) {
        updates.notes = String(payload.notes || "").trim();
      }

      if (!Object.keys(updates).length) {
        return json(res, 400, { error: "No updatable fields provided." });
      }

      const response = await supabaseRequest(config, `?id=eq.${encodeURIComponent(id)}`, {
        method: "PATCH",
        headers: { Prefer: "return=representation" },
        body: JSON.stringify(updates),
      });
      const body = await response.text();

      if (!response.ok) {
        return json(res, response.status, {
          error: body || "Failed to update prototype.",
        });
      }

      const updated = JSON.parse(body);
      return json(res, 200, { item: updated?.[0] || null });
    } catch (error) {
      return json(res, 500, { error: error.message || "Unexpected error while updating prototype." });
    }
  }

  if (req.method === "DELETE") {
    try {
      const payload = typeof req.body === "string" ? JSON.parse(req.body || "{}") : req.body || {};
      const id = String(payload.id || "").trim();
      if (!id) return json(res, 400, { error: "Field 'id' is required for DELETE." });

      const response = await supabaseRequest(config, `?id=eq.${encodeURIComponent(id)}`, {
        method: "DELETE",
        headers: { Prefer: "return=representation" },
      });
      const body = await response.text();

      if (!response.ok) {
        return json(res, response.status, {
          error: body || "Failed to delete prototype.",
        });
      }

      const deleted = body ? JSON.parse(body) : [];
      return json(res, 200, { deleted: deleted?.[0] || { id } });
    } catch (error) {
      return json(res, 500, { error: error.message || "Unexpected error while deleting prototype." });
    }
  }

  res.setHeader("Allow", "GET, POST, PATCH, DELETE");
  return json(res, 405, { error: "Method Not Allowed" });
};
