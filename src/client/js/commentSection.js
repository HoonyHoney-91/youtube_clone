const videoContainer = document.getElementById("videoContainer");
const form = document.getElementById("commentForm");
const deleteCommentBtn = document.querySelectorAll("#deleteCommentBtn");

const addComment = (text, id) => {
    const videoComments = document.querySelector(".video__comments ul");
    const newComment = document.createElement("li");
    newComment.dataset.id = id;
    newComment.className = "video__comment";
    const icon = document.createElement("i");
    icon.className = "fas fa-comment";
    const span = document.createElement("span");
    span.innerText = ` ${text}`;
    const span2 = document.createElement("span");
    span2.innerText = "❌";
    span2.dataset.id = id;
    span2.id = "deleteCommentBtn";
    newComment.appendChild(icon);
    newComment.appendChild(span);
    newComment.appendChild(span2);
    videoComments.prepend(newComment);
    const newCommentBtn = document.getElementById("deleteCommentBtn");
    if (newCommentBtn) {
        newCommentBtn.addEventListener("click", handleCommentDelete);
    }
};

const handleSubmit = async(event) => {
    event.preventDefault();
    const textarea = form.querySelector("textarea");
    const text = textarea.value;
    const videoId = videoContainer.dataset.id;
    if (text === "") {
        return;
    }
    const response = await fetch(`/api/videos/${videoId}/comment`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ text }),
    });
    if (response.status === 201) {
        textarea.value="";
        const {newCommentId} = await response.json();
        addComment(text, newCommentId);
    }
};

if (form) {
    form.addEventListener("submit", handleSubmit);
};

const handleCommentDelete = async (event) => {
    const commentId = event.target.dataset.id;
    const response = await fetch(`/api/comments/${commentId}`, {
      method: "DELETE",
      headers: {
            "Content-Type": "application/json",
        },
    });
    if (response.status === 201) {
        console.log("DB Delete Succeed!!!");
        event.target.parentNode.remove();
    }
};
  
if (deleteCommentBtn) {
    deleteCommentBtn.forEach((commentBtn) => {
        commentBtn.addEventListener("click", handleCommentDelete);
    });
}