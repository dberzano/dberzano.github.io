/* misc.js */

var Misc = {

  init : function() {

    if ( Misc.auto_anchors !== undefined ) {
      Misc.init_auto_anchors();
    }

  },

  init_auto_anchors : function() {

    level_counters = [ 0, 0, 0, 0, 0, 0, 0, 0, 0 ];

    // Automatic numbered anchors
    $( Misc.general.container ).children().each( function() {

      m = $(this).prop('tagName').match(/^H([0-9])$/);
      if ( m ) {
        level = parseInt(m[1]);
        if (level >= Misc.auto_anchors.start_level) {
          level_counters[level]++;
          level_str = ''

          for (i=Misc.auto_anchors.start_level; i<=level; i++) {
            level_str = level_str + level_counters[i];
            if (i != level) level_str += '.';
          }

          // Use header text instead of number for reference
          if ( Misc.auto_anchors.use_names ) {
            anchor = $(this).text().toLowerCase();
            anchor = anchor.replace(/[^a-z0-9]/g, '_');
            anchor = anchor.replace(/_+/g, '_');
          }
          else {
            anchor = 'sec-' + anchor;
          }

          // Instead of using CSS numbering prepend section string
          if ( Misc.auto_anchors.prepend_numbers ) {
            $(this).prepend( level_str + '&nbsp;' );
          }

          // Create new header
          new_header = $('<h'+level+'></h'+level+'>');
          new_anchor = $('<a></a>')
            .attr('name', anchor)
            .attr('href', '#'+anchor);
          new_header.append(new_anchor);

          $(this).contents().each( function() {
            $(this).detach().appendTo( new_anchor );
          } );

          $(this).replaceWith( $(new_header) );

        }
      }

    } );

  }

}
