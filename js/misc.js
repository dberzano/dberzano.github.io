/* misc.js */

// Separate at this tag name
tag_name = 'h2';

// jQuery object containing what we want to paginate
container_name = 'content';

// Class name of the pages
paginator_class = tag_name + '-inner-page';

// Prefix to the name of the inner pages
paginator_prefix = 'inner-page-';

// Start numbering from H1, H2...?
start_numb_from_level = 2;  // h2


$(document).ready( function() {

  level_counters = [ 0, 0, 0, 0, 0, 0, 0, 0, 0 ];
  tag_name = tag_name.toUpperCase();

  // Automatic numbered anchors
  $( '#'+container_name ).children().each( function() {

    m = $(this).prop('tagName').match(/^H([0-9])$/);
    if ( m ) {
      level = parseInt(m[1]);
      if (level >= start_numb_from_level) {
        level_counters[level]++;
        level_str = ''
        for (i=start_numb_from_level; i<=level; i++) {
          level_str = level_str + level_counters[i];
          if (i != level) level_str += '-';
        }
        // $(this).text( $(this).text() + " - level: " + level_str );

        // Create new header
        new_header = $('<h'+level+'></h'+level+'>');
        new_anchor = $('<a></a>')
          .attr('name', 'sec-'+level_str)
          .attr('href', '#sec-'+level_str);
        new_header.append(new_anchor);

        $(this).contents().each( function() {
          $(this).detach().appendTo( new_anchor );
        } );

        $(this).replaceWith( $(new_header) );

      }
    }

  } );


  // I can change the DOM while iterating on it
  // http://stackoverflow.com/questions/4735604/jquery-each-behavior-if-changing-dom-within-loop

  page_num = 0;
  page = undefined;

  $( '#'+container_name ).children().each( function() {

    // Separate at tag named tag_name (i.e., H2 -- uppercase)
    if ( $(this).prop('tagName') == tag_name ) {

      page_num++;
      page = $('<div></div>')
               .addClass(paginator_class)
               .attr('id', paginator_prefix+page_num)
               .hide();
      $(this).after( page );
      $(this).detach().prependTo( page );

    }
    else if (page_num != 0) {

      // alert(in_page);
      $(this).detach().appendTo( $(page) );

    }

  } );

  // Show the correct section based on the hash written in the browser's URL

  m = window.location.hash.match(/^#sec-([0-9]+)/);
  level = (m ? parseInt(m[1]) : 1);
  $('#'+paginator_prefix+level).show();

});
