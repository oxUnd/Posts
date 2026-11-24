vim9script

# The mvi launcher supplies MVI_PATH even when -u NONE skips its vimrc.
# Load only the renderer, so batch exports do not run the user's plugins.
if empty($MVI_PATH) || !filereadable($MVI_PATH .. '/autoload/mvi/orgexport.vim')
    writefile(['export: mvi with the Vim 9 Org renderer is required'], '/dev/stderr', 'a')
    cquit
endif
&runtimepath = escape($MVI_PATH, ',\') .. ',' .. &runtimepath
import autoload 'mvi/orgexport.vim' as Org

try
    if empty($MVI_ORG_OUTPUT)
        throw 'MVI_ORG_OUTPUT is required'
    endif
    var source = expand('%:p')
    var lines = getline(1, '$')
    var html = Org.Html(lines, source)

    # Keep one site identity regardless of document or editor settings.
    html = substitute(html, 'data-theme="[^"]*"', 'data-theme="mono"', '')
    html = substitute(html, 'data-default-theme="[^"]*"', 'data-default-theme="mono"', '')

    # Published pages are flat; each document owns a separate asset directory.
    if !empty($MVI_ASSET_BASE)
        var asset_base = Org.Escape($MVI_ASSET_BASE)
        html = substitute(html, '\C\%(src\|href\)="\zs\%(\./\)\?images/', (_) => asset_base, 'g')
    endif

    # The current renderer does not yet apply these Org export switches.
    var active_block = ''
    for directive in lines
        if !empty(active_block)
            if directive =~? '^\s*#+END_' .. active_block .. '\>'
                active_block = ''
            endif
        else
            active_block = matchstr(directive, '\c^\s*#+BEGIN_\zs\w\+')
        endif
        if empty(active_block) && directive =~? '^\s*#+OPTIONS:'
            if directive =~? '\<toc:nil\>'
                html = substitute(html, '<aside class="toc">\_.\{-}</aside>', '', '')
            endif
            if directive =~? '\<title:nil\>'
                html = substitute(html, '<header class="document-header">\_.\{-}</header>', '', '')
            endif
        endif
    endfor

    # Vim9 emits the document header before main, while its theme expects it
    # inside the document card. Leave renderers that already nest it alone.
    var title_pattern = '<header class="document-header">\_.\{-}</header>\ze\_s*<main\>'
    var document_header = matchstr(html, title_pattern)
    if !empty(document_header)
        document_header = substitute(document_header, '<p>\s*</p>', '', 'g')
        html = substitute(html, title_pattern, '', '')
        html = substitute(html, '<main[^>]*>', (match) => match[0] .. "\n" .. document_header, '')
    endif

    var theme_dir = expand('<script>:p:h') .. '/theme'
    var style = '<style data-site-layout>' .. "\n" .. join(readfile(theme_dir .. '/site.css'), "\n") .. "\n</style>"
    html = substitute(html, '</head>', (_) => style .. "\n</head>", '')

    var is_home = fnamemodify($MVI_ORG_OUTPUT, ':t') == 'index.html'
    var header =<< trim END
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
        <a class="site-link" href="/" rel="home"{{HOME_STATE}}>首页</a>
        <a class="site-link" href="https://github.com/oxund">GitHub <span class="site-external" aria-hidden="true">↗</span></a>
        </nav>
        </header>
        </div>
    END
    var header_html = substitute(join(header, "\n"), '{{HOME_STATE}}', is_home ? ' aria-current="page"' : '', '')
    html = substitute(html, '<body>', (_) => "<body>\n" .. header_html, '')

    if is_home && !empty($MVI_HOME_FEATURE)
        var feature =<< trim END
            <figure class="home-feature">
            <div class="home-feature-frame">
            <img src="{{IMAGE}}" alt="本次发布随机选取的黑白风景照片">
            </div>
            <figcaption>Random frame for this release · <a href="https://picsum.photos/">Picsum</a></figcaption>
            </figure>
        END
        var image = Org.Escape($MVI_HOME_FEATURE)
        var feature_html = substitute(join(feature, "\n"), '{{IMAGE}}', (_) => image, '')
        html = substitute(html, '<main[^>]*>', (match) => match[0] .. "\n" .. feature_html, '')
    endif

    var theme_script =<< trim END
        <script data-site-theme>
        document.documentElement.dataset.theme = "mono";
        try { localStorage.removeItem("mvi-document-theme"); } catch (_) {}
        </script>
    END
    html = substitute(html, '</body>', (_) => join(theme_script, "\n") .. "\n</body>", '')
    writefile(split(html, "\n", true), $MVI_ORG_OUTPUT)
catch
    writefile(['export: ' .. v:exception .. ' at ' .. v:throwpoint], '/dev/stderr', 'a')
    cquit
endtry
qa!
