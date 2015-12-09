$(document).ready(function() {

    $(".play").click(function() {
        // Ripple effect on the whole background
        $(".playRipple").addClass("rippleEffect");

        // Change title and subtitle color
        // TODO

        setTimeout(function() {
            // Wrapper fade out, and launch game when
            $(".wrapper").addClass("fadeout").one("webkitAnimationEnd mozAnimationEnd MSAnimationEnd oanimationend animationend", function() {
                $(".wrapper").hide();

                // Create new game
                new Game('renderCanvas');
            });
        }, 1000);

    });




});