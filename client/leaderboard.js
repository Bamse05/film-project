document.addEventListener("DOMContentLoaded", function () {

});

async function createLeaderBoard(parentContainer) {
    const Leaderboard = document.createElement("div");
    Leaderboard.id = Leaderboard;
    Leaderboard.classList.add("Leaderboard");

    parentContainer.appendChild(Leaderboard);
    
    const LeaderboardTitle = document.createElement("h2");
    LeaderboardTitle.textContent = "TOP CORN POPPERS";
    
    Leaderboard.appendChild(LeaderboardTitle);
    


}