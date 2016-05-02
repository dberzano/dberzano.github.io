/* misc.js */

var Misc = {

  re : {
    invalid_anchor : new RegExp( /[<>#%"\s[{}|\\^\[\]`;\/?:@&=+$,]/g ),
    mult_uscores   : new RegExp( /_{2,}/g ),
    ext_uscores    : new RegExp( /(^_|_$)/g )
  },

  auto_anchors : undefined,

  init : function() {

    if (Misc.auto_anchors !== undefined) {
      Misc.init_auto_anchors();
    }
    if ($("#deprecated_notice").length) {
      Misc.init_deprecated_filler("#deprecated_notice");
      $(window).resize(function() {
        Misc.init_deprecated_filler("#deprecated_notice");
      });
    }

  },

  init_deprecated_filler : function(selector) {
    var height = Math.round($(selector).height() + 30);
    var spacer_id = $(selector).attr("id")+"_spacer";
    var spacer = $("#"+spacer_id);
    if (!spacer.length) {
      $("<div/>").attr("id", spacer_id)
                 .insertAfter(selector);
      spacer = $("#"+spacer_id);
    }
    spacer.css("margin-top", height+"px");
  },

  init_auto_anchors : function() {

    level_counters = [ 0, 0, 0, 0, 0, 0, 0, 0, 0 ];

    if ( Misc.auto_anchors.create_toc ) {
      toc = $('<ul></ul>');
      toc_level = toc;
    }
    else {
      toc = undefined;
      toc_level = undefined;
    }

    prev_level = Misc.auto_anchors.start_level;

    // Automatic numbered anchors
    $( Misc.general.container ).children().each( function() {

      m = $(this).prop('tagName').match(/^H([0-9])$/);
      if ( m ) {
        level = parseInt(m[1]);
        if (level >= Misc.auto_anchors.start_level) {
          level_counters[level]++;
          for (i=level+1; i<level_counters.length; i++) {
            level_counters[i]=0;
          }
          level_str = ''

          for (i=Misc.auto_anchors.start_level; i<=level; i++) {
            level_str = level_str + level_counters[i];
            if (i != level) level_str += '.';
          }

          // Use header text instead of number for reference
          if ( Misc.auto_anchors.use_names === true ) {
            anchor = $(this).text().toLowerCase()
                       .replace(Misc.re.invalid_anchor, '_')
                       .replace(Misc.re.mult_uscores, '_')
                       .replace(Misc.re.ext_uscores, '');
          }
          else {
            anchor = 'sec-' + level_str;
          }

          // Instead of using CSS numbering prepend section string
          if ( Misc.auto_anchors.prepend_numbers ) {
            $(this).prepend( level_str + '&nbsp;' );
          }

          // Creating TOC?
          if (toc_level !== undefined && level >= Misc.auto_anchors.start_level) {

            ldiff = level - prev_level;

            if (ldiff > 0) {
              for (l=0; l<ldiff; l++) {
                new_toc_level = $('<ul></ul>');
                toc_level.append( new_toc_level );
                toc_level = new_toc_level;
              }
            }
            else if (ldiff < 0) {
              for (l=ldiff; l<0; l++) {
                toc_level = toc_level.parent();
              }
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
      $( Misc.general.toc_content ).empty().append( toc );
    }
    else {
      $( Misc.general.toc ).hide();
    }

  }

};
