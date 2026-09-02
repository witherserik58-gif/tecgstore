const videocards = document.querySelectorAll(".box1");

videocards.forEach(function(card) {
    card.addEventListener("click", function() {
        window.location.href = "videocard/videocard.html";
    });
});
