procedure render_biosig_pro (
    p_item   in            apex_plugin.t_item,
    p_plugin in            apex_plugin.t_plugin,
    p_param  in            apex_plugin.t_item_render_param,
    p_result in out nocopy apex_plugin.t_item_render_result
)
is
    l_name        varchar2(30);
    l_height      varchar2(10);
    l_pen_color   varchar2(20);
    l_width       varchar2(10);
    l_pen_width   varchar2(10);
    l_rotate      varchar2(10);
    l_allow_text  varchar2(1);
    l_placeholder varchar2(200);
begin
    l_name        := apex_plugin.get_input_name_for_page_item(false);
    l_height      := nvl(p_item.attribute_01, '200');
    l_pen_color   := nvl(p_item.attribute_02, '#000000');
    l_width       := nvl(p_item.attribute_03, '600');
    l_pen_width   := nvl(p_item.attribute_04, '2');
    l_rotate      := nvl(p_item.attribute_05, '0');
    l_allow_text  := nvl(p_item.attribute_06, 'N');
    l_placeholder := nvl(p_item.attribute_07, 'Sign here...');

    sys.htp.p('<div class="biosig-container" id="'||p_item.name||'_container">');
    sys.htp.p('  <canvas id="'||p_item.name||'_canvas" class="biosig-canvas" width="'||l_width||'" height="'||l_height||'"></canvas>');
    sys.htp.p('  <div class="biosig-footer">');
    sys.htp.p('    <span class="biosig-label">X Signature</span>');
    sys.htp.p('    <div class="biosig-actions">');
    sys.htp.p('      <span class="biosig-pointer-badge" id="'||p_item.name||'_pointer_badge">🖱 Mouse</span>');
    sys.htp.p('      <button type="button" class="biosig-clear" onclick="biosig_clear('''||p_item.name||''')">Clear</button>');
    sys.htp.p('    </div>');
    sys.htp.p('  </div>');
    if l_allow_text = 'Y' then
        sys.htp.p('  <div class="biosig-text-mode">');
        sys.htp.p('    <input type="text" id="'||p_item.name||'_text_input" placeholder="Type your name to sign" />');
        sys.htp.p('    <button type="button" class="biosig-clear" onclick="biosig_setTextMode('''||p_item.name||''', document.getElementById('''||p_item.name||'_text_input'').value)">Apply</button>');
        sys.htp.p('  </div>');
    end if;
    sys.htp.p('  <input type="hidden" name="'||l_name||'" id="'||p_item.name||'" value="">');
    sys.htp.p('</div>');

    apex_javascript.add_onload_code(
        p_code => 'initBioSigPro({' ||
                      'id:              "'  || p_item.name   || '",' ||
                      'canvasWidth:      '  || l_width       || ','  ||
                      'canvasHeight:     '  || l_height      || ','  ||
                      'strokeColor:     "'  || l_pen_color   || '",' ||
                      'strokeWidth:      '  || l_pen_width   || ','  ||
                      'rotateDeg:        '  || l_rotate      || ','  ||
                      'placeholderText: "'  || l_placeholder || '"'  ||
                  '});'
    );
end render_biosig_pro;
