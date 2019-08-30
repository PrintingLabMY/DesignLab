/* STEP 1: Select Product */
$(function() {
  /* Trigger the next step: Select Artwork */
  $('[data-toggle="artwork"]').on('click', function() {
    $('#product').fadeOut('fast', function() {
      $(this).addClass('d-none');
      $('#artwork').fadeIn('slow').removeClass('d-none');
    });
  });
});

/* STEP 2: Select Artwork */
$(function() {
  var artworks = [
    'https://image.freepik.com/free-vector/abstract-gradient-business-card-template_52683-19400.jpg',
    'https://image.freepik.com/free-psd/white-yellow-business-card_1435-18.jpg',
    'https://image.freepik.com/free-psd/clean-clear_57821-74.jpg',
    'https://image.freepik.com/free-psd/blank-business-card-design-mockup_53876-57938.jpg',
    'https://image.freepik.com/free-psd/elegant-corporate-card_1435-1143.jpg',
    'https://image.freepik.com/free-psd/beautiful-modern-yellow-business-card_1409-781.jpg',
    'https://image.freepik.com/free-psd/corporate-card-template_1409-820.jpg',
    'https://image.freepik.com/free-psd/stylish-business-card_103713-67.jpg',
    'https://image.freepik.com/free-psd/corporate-business-card_98870-31.jpg',
    'https://image.freepik.com/free-psd/orange-elegant-corporate-card_1409-767.jpg'
  ];

  /* Push artworks to artwork container */
  $.each(artworks, function(i, artwork) {
    var html =
      '<div class="artwork-card card shadow-sm border-0" data-artwork="'+i+'">'
      + '  <div class="card-img-top">'
      + '    <img class="img-fluid" src="'+artwork+'">'
      + '  </div>'
      + '  <div class="card-title p-3">Some Description...</div>'
      + '  <div class="artwork-card__choice reject"></div>'
      + '  <div class="artwork-card__choice like"></div>'
      + '  <div class="artwork-card__drag"></div>'
      + '</div>'

    $('#artworks').append(html);
  });

  /* ------------------------------------------------------------------- */
  var animating = false;
  var cardsCounter = 0;
  var numOfCards = 10;
  var decisionVal = 80;
  var pullDeltaX = 0;
  var deg = 0;
  var $card, $cardReject, $cardLike;

  var liked = [];
  var rejected = [];

  /**
   * Detect Touch Event
   */
  $(document).on("mousedown touchstart", ".artwork-card:not(.inactive)", function(e) {
    if (animating) return;

    $card = $(this);
    $cardReject = $(".artwork-card__choice.reject", $card);
    $cardLike = $(".artwork-card__choice.like", $card);
    var startX =  e.pageX || e.originalEvent.touches[0].pageX;

    /**
     * Detech Swipe Event
     */
    $(document).on("mousemove touchmove", function(e) {
      var x = e.pageX || e.originalEvent.touches[0].pageX;
      pullDeltaX = (x - startX);
      if (!pullDeltaX) return;
      if (cardsCounter === numOfCards) return;
      pullChange();
    });

    /**
     * Detech Touch Release Event
     */
    $(document).on("mouseup touchend", function() {
      $(document).off("mousemove touchmove mouseup touchend");
      if (!pullDeltaX) return; /* prevents from rapid click events */
      release();
    });
  });

  /**
   * Respond to swiping event
   */
  function pullChange() {
    /* Transform & translate card */
    animating = true;
    deg = pullDeltaX / 10;
    $card.css("transform", "translateX("+ pullDeltaX +"px) rotate("+ deg +"deg)");

    /* Change card opacity */
    var opacity = pullDeltaX / 100;
    var rejectOpacity = (opacity >= 0) ? 0 : Math.abs(opacity);
    var likeOpacity = (opacity <= 0) ? 0 : opacity;
    $cardReject.css("opacity", rejectOpacity);
    $cardLike.css("opacity", likeOpacity);
  };

  /**
   * Respond to release event
   */
  function release() {
    /* Swipe Right - Like */
    if (pullDeltaX >= decisionVal) {
      $card.addClass("to-right chosen");
      liked.push($card); /* Add to liked list */

      /* Animating like button */
      $('.js__like-btn').addClass('active');
      setTimeout(function() {
        $('.js__like-btn').removeClass('active');
      }, 300);

    /* Swipe Left - Reject */
    } else if (pullDeltaX <= -decisionVal) {
      $card.addClass("to-left chosen");
      rejected.push($card); /* Add to rejected list */

      /* Animating reject button */
      $('.js__reject-btn').addClass('active');
      setTimeout(function() {
        $('.js__reject-btn').removeClass('active');
      }, 300);
    }

    if (Math.abs(pullDeltaX) >= decisionVal) {
      $card.addClass("inactive");

      setTimeout(function() {
        $card.addClass("below").removeClass("inactive to-left to-right"); /* Move card to the back of the card deck */
        cardsCounter++; /* Increment card counter */

        /* Detect if reaching the end of artwork selection */
        if (cardsCounter === numOfCards) {
          /* Add liked cards to favourite list */
          $.each(liked, function(i, card) {
            var artwork = $(card).find('img').attr('src');
            var html = '<div class="favourite col-12">'
            + '  <div class="hoverable-card card h-100" data-toggle="favourite">'
            + '    <img class="img-fluid mx-3 mt-2" src="'+artwork+'">'
            + '    <button class="btn btn-link mt-auto font-weight-bold text-dark text-decoration-none">Description</button>'
            + '  </div>'
            + '</div>';

            $('#favourites').append(html)
          });

          /* cardsCounter = 0; */
          /* $(".artwork-card").removeClass("below"); */

          /* Trigger the next step: Choose Your Favourite */
          $('#artwork').fadeOut('fast', function() {
            $(this).addClass('d-none');
            $('#favourite').fadeIn('slow').removeClass('d-none');
          });
        }

        /* Update card counter */
        $('.js__cards-counter').html(numOfCards-cardsCounter);
      }, 300);
    }

    if (Math.abs(pullDeltaX) < decisionVal) {
      $card.addClass("reset");
    }

    setTimeout(function() {
      $card.attr("style", "").removeClass("reset")
        .find(".artwork-card__choice").attr("style", "");

      pullDeltaX = 0;
      animating = false;
    }, 300);
  };

  /**
   * Like Button Click Event
   */
  $('.js__like-btn').on('click', function() {
    if (animating) return;
    swipeByClick('like');
  });

  /**
   * Reject Button Click Event
   */
  $('.js__reject-btn').on('click', function() {
    if (animating) return;
    swipeByClick('reject');
  });

  /**
   * Respond to button click event
   */
  function swipeByClick(action) {
    /* Get the front most card */
    $('#artworks').children(':not(.chosen)').each(function() {
      $card = $(this);
    });

    $cardReject = $(".artwork-card__choice.reject", $card);
    $cardLike = $(".artwork-card__choice.like", $card);
    var startX =  $(document).width()/2;
    var x = startX;

    /* Simulate swiping action */
    function loopAnimation() {
      setTimeout(function() {
        if (action === 'like') x += 50;
        if (action === 'reject') x -= 50;

        pullDeltaX = (x - startX);

        if (!pullDeltaX) return;
        if (cardsCounter === numOfCards) return;

        pullChange();

        var offscreenWidth;
        if (action === 'like') offscreenWidth = $(document).width();
        if (action === 'reject') offscreenWidth = -($(document).width()/2);

        if (action === 'like' && x < offscreenWidth) {
          loopAnimation();
          return;
        }

        if (action === 'reject' && x > offscreenWidth) {
          loopAnimation();
          return;
        }

        release();
      }, 100);
    }

    loopAnimation();
  }
});

/* STEP 3: Choose Favourites */
$(function() {
  /**
   * Choose Favourite Event
   */
  $('#favourites').on('click', '[data-toggle="favourite"]', function() {
    $('[data-toggle="favourite"]').removeClass('active');
    $(this).addClass('active');
  });

  /**
   * Save Favourite Button
   */
  $('.js__save-favourite-btn').on('click', function() {
    var chosen = $('#favourites').find('.active');
    if (typeof chosen === 'undefined' || chosen.length === 0) {
      alert('Please choose the most favourite artwork!')
      return;
    }

    /* Trigger the Mission Completed page */
    $('#favourite').fadeOut('fast', function() {
      $(this).addClass('d-none');
      $('#completed').fadeIn('slow').removeClass('d-none');
    });
  });
});
