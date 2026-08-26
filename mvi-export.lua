local mvi = require("mvi")

local plugin = mvi.plugin {
    api = 1,
    name = "posts-export",
    version = "1.0.0",
    permissions = {
        "buffer.read",
        "filesystem.write",
        "editor.quit",
    },
}

local output = os.getenv("MVI_ORG_OUTPUT")
if not output or output == "" then
    error("MVI_ORG_OUTPUT is required")
end

local org_mode = require("org_mode")
local html = org_mode.render_html(plugin.editor:current_buffer())

-- This site intentionally has one visual identity. Override both the initial
-- and fallback theme so mvi's document-level setting cannot vary by page.
html = html:gsub('data%-theme="[^"]+"', 'data-theme="mono"', 1)
html = html:gsub('data%-default%-theme="[^"]+"', 'data-default-theme="mono"', 1)

-- Org sources keep assets in a sibling images/ directory. Published pages are
-- flat, so namespace those links by page to prevent equal image names in two
-- articles from overwriting each other.
local asset_base = os.getenv("MVI_ASSET_BASE")
if asset_base and asset_base ~= "" then
    for _, attribute in ipairs({ "src", "href" }) do
        html = html:gsub(attribute .. '="images/', function()
            return attribute .. '="' .. asset_base
        end)
        html = html:gsub(attribute .. '="./images/', function()
            return attribute .. '="' .. asset_base
        end)
    end
end

-- mvi deliberately exports self-contained documents instead of applying a
-- site template. Add shared site chrome here so every generated page has the
-- same identity and navigation without duplicating markup in Org sources.
local layout_style = [[
<style data-site-layout>
.site-header-wrap {
    width: min(1180px, calc(100% - 56px));
    margin: 0 auto -8px;
    padding-top: 20px;
}
.document-controls {
    display: none !important;
}
.site-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 1.5rem;
    padding: 14px 16px;
    border: 1px solid var(--line);
    border-radius: var(--radius);
    background: color-mix(in srgb, var(--surface) 94%, transparent);
    box-shadow: var(--shadow);
    backdrop-filter: blur(14px);
}
.site-brand {
    display: inline-flex;
    align-items: center;
    gap: 12px;
    min-width: 0;
    color: var(--text);
    text-decoration: none;
}
.site-brand-mark {
    display: grid;
    flex: 0 0 auto;
    place-items: center;
    width: 42px;
    height: 42px;
    border-radius: calc(var(--radius) * .72);
    background: var(--accent-soft);
    color: var(--accent-strong);
    font: 800 1rem/1 var(--mono);
    letter-spacing: -.08em;
}
.site-brand-copy {
    display: grid;
    gap: 1px;
}
.site-brand-name {
    font: 800 1rem/1.2 var(--display);
    letter-spacing: -.02em;
}
.site-brand-note {
    color: var(--muted);
    font: 600 .7rem/1.35 var(--mono);
    letter-spacing: .07em;
    text-transform: uppercase;
}
.site-links {
    display: flex;
    align-items: center;
    gap: 4px;
}
.site-link {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 8px 11px;
    border-radius: calc(var(--radius) * .65);
    color: var(--muted);
    text-decoration: none;
    font: 700 .75rem/1 var(--mono);
    transition: color 140ms ease, background 140ms ease;
}
.site-link:hover,
.site-link[aria-current="page"] {
    color: var(--accent);
    background: var(--accent-soft);
}
.site-external {
    color: var(--faint);
}
.home-feature {
    grid-column: 2;
    grid-row: 1;
    align-self: start;
    position: sticky;
    top: 28px;
    margin: 0;
}
main:has(> .home-feature) {
    display: grid;
    grid-template-columns: minmax(0, 1fr) minmax(280px, 360px);
    column-gap: clamp(42px, 5vw, 72px);
    align-items: start;
}
main:has(> .home-feature) > .content {
    grid-column: 1;
    grid-row: 1;
    min-width: 0;
    max-width: none;
}
.home-feature-frame {
    aspect-ratio: 3 / 4;
    overflow: hidden;
    border: 2px solid var(--line);
    background: var(--surface-2);
}
.home-feature img {
    display: block;
    width: 100%;
    height: 100%;
    object-fit: cover;
    margin: 0;
    border-radius: 0;
    box-shadow: none;
    filter: grayscale(1) contrast(1.04);
}
.home-feature figcaption {
    margin-top: 9px;
    color: var(--muted);
    font: 600 .68rem/1.45 var(--mono);
    text-align: right;
}
.home-feature figcaption a {
    color: inherit;
}
@media (max-width: 920px) {
    .site-header-wrap {
        width: min(760px, calc(100% - 40px));
    }
    main:has(> .home-feature) {
        display: grid;
        grid-template-columns: minmax(0, 1fr);
        column-gap: 0;
    }
    main:has(> .home-feature) > .content {
        grid-column: 1;
        grid-row: 2;
    }
    .home-feature {
        grid-column: 1;
        grid-row: 1;
        position: static;
        margin-bottom: 36px;
    }
    .home-feature-frame {
        aspect-ratio: 16 / 9;
    }
}
@media (max-width: 600px) {
    .site-header-wrap {
        width: calc(100% - 24px);
        margin-bottom: 12px;
        padding-top: 12px;
    }
    .site-header {
        align-items: flex-start;
        padding: 12px;
    }
    .site-brand-note {
        display: none;
    }
    .site-links {
        gap: 0;
    }
    .site-link {
        padding: 9px 8px;
    }
    .home-feature {
        display: none;
    }
}
@media print {
    .site-header-wrap {
        display: none;
    }
}
</style>]]

html = html:gsub("</head>", function()
    return layout_style .. "\n</head>"
end, 1)

local is_home = output:match("/index%.html$") ~= nil
local home_state = is_home and ' aria-current="page"' or ""
local site_header = [[
<div class="site-header-wrap">
<header class="site-header">
<a class="site-brand" href="/" rel="home" aria-label="OxUnd. 首页">
<span class="site-brand-mark" aria-hidden="true">O/</span>
<span class="site-brand-copy">
<span class="site-brand-name">OxUnd.</span>
<span class="site-brand-note">Code · Systems · Life</span>
</span>
</a>
<nav class="site-links" aria-label="站点导航">
<a class="site-link" href="/" rel="home"]]
    .. home_state
    .. [[>首页</a>
<a class="site-link" href="https://github.com/oxund">GitHub <span class="site-external" aria-hidden="true">↗</span></a>
</nav>
</header>
</div>]]

html = html:gsub("<body>", function()
    return "<body>\n" .. site_header
end, 1)

local home_feature = os.getenv("MVI_HOME_FEATURE")
if is_home and home_feature and home_feature ~= "" then
    local feature_markup = [[
<figure class="home-feature">
<div class="home-feature-frame">
<img src="]] .. home_feature .. [[" alt="本次发布随机选取的黑白风景照片">
</div>
<figcaption>Random frame for this release · <a href="https://picsum.photos/">Picsum</a></figcaption>
</figure>]]
    html = html:gsub("(<main[^>]*>)", function(opening)
        return opening .. "\n" .. feature_markup
    end, 1)
end

local fixed_theme_script = [[
<script data-site-theme>
document.documentElement.dataset.theme = "mono";
try { localStorage.removeItem("mvi-document-theme"); } catch (_) {}
</script>]]
html = html:gsub("</body>", function()
    return fixed_theme_script .. "\n</body>"
end, 1)

local ok, err = plugin.fs:write(output, html)
if not ok then
    error("unable to write " .. output .. ": " .. tostring(err and err.message or err))
end

plugin.editor:quit()
