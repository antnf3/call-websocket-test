const userList = document.querySelector("ul");
const callInfoForm = document.querySelector("#callInfo");

const socket = new WebSocket(`ws:${window.location.host}`);

function clearAllSelected() {
  const lis = document.querySelectorAll("ul > li");
  lis.forEach((aLi) => aLi.classList.remove("selected-user"));
}
function paintMessage(message) {
  const li = document.createElement("li");
  li.innerText = message;
  li.onclick = () => {
    clearAllSelected();
    li.classList.add("selected-user");
  };
  // userList.innerHTML = "";
  userList.appendChild(li);
}
function makeMessage(type, payload) {
  return JSON.stringify({ type, payload });
}

function getSelectedUser() {
  const lis = document.querySelectorAll("ul > li");
  let user = "";
  const selecteduser = lis.forEach((aLi) => {
    if (aLi.className === "selected-user") {
      user = aLi.innerText;
    }
  });
  return user;
}
socket.addEventListener("open", () => {
  console.log("Connected to Server");
  socket.send(makeMessage("login", "970134"));
});

socket.addEventListener("message", (message) => {
  const { data: originData } = message;
  const data = JSON.parse(originData);
  switch (data.type) {
    case "login":
      paintMessage(data.payload);
      break;
    case "call":
      console.log(data.payload);
      break;
  }
});

socket.addEventListener("close", () => {
  console.log("Disconnected to Server");
});

callInfoForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const selectedUser = getSelectedUser();
  if (selectedUser !== "") {
    const inputs = callInfoForm.querySelectorAll("input");
    let inputDatas = [];
    inputs.forEach((input) => {
      inputDatas.push(input.value);
    });
    const value = { user: selectedUser, data: inputDatas.join("|") };
    socket.send(makeMessage("call", value));
  } else {
    alert("상담원을 선택하세요.");
  }
});
