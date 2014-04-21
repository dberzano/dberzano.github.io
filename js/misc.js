/* misc.js */

var Misc = {

  re : {
    invalid_anchor : new RegExp( /[<>#%"\s[{}|\\^\[\]`;\/?:@&=+$,]/g ),
    mult_uscores   : new RegExp( /_{2,}/g ),
    ext_uscores    : new RegExp( /(^_|_$)/g )
  },

  init : function() {

    if ( Misc.auto_anchors !== undefined ) {
      Misc.init_auto_anchors();
    }

  },

  init_auto_anchors : function() {

    level_counters = [ 0, 0, 0, 0, 0, 0, 0, 0, 0 ];

    if ( Misc.auto_anchors.create_toc ) {
      toc = $('<ul></ul>');
      toc_level = toc;
    }

    prev_level = Misc.auto_anchors.start_level;

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
            anchor = $(this).text().toLowerCase()
                       .replace(Misc.re.invalid_anchor, '_')
                       .replace(Misc.re.mult_uscores, '_')
                       .replace(Misc.re.ext_uscores, '');
          }
          else {
            anchor = 'sec-' + anchor;
          }

          // Instead of using CSS numbering prepend section string
          if ( Misc.auto_anchors.prepend_numbers ) {
            $(this).prepend( level_str + '&nbsp;' );
          }

          // Creating TOC?
          if (toc_level !== undefined) {

            if (level > prev_level) {
              new_toc_level = $('<ul></ul>');
              toc_level.append( new_toc_level );
              toc_level = new_toc_level;
            }
            else if (level < prev_level) {
              toc_level = toc_level.parent();
            }


            li = $('<li></li>').append(
              $('<a></a>')
                .attr('href', '#'+anchor)
                .text( $(this).text() )
            );
            toc_level.append( li );

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

          //console.log( 'previous: ' + prev_level + ', current: ' + level );
          prev_level = level;

        }
      }

    } );

    // Append TOC to DOM
    if (toc !== undefined) {
      $( Misc.general.toc ).empty().append( toc );
    }

  }

};
