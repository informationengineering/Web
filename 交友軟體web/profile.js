const urlParams = new URLSearchParams(window.location.search);
const id = urlParams.get("id");

const profiles = {
  1: {
    name: "小美",
    description: "愛好旅行、喜歡貓咪、喜歡甜點。",
    img: "小美.jpg",
  },
  2: {
    name: "小明",
    description: "熱愛籃球、喜歡科技新知、擅長烹飪。",
    img: "小明.jpg",
  },
  3: {
    name: "小華",
    description: "愛攝影、熱愛健身、旅行愛好者。",
    img: "小華.jpg",
  },
};

const profile = profiles[id];

if (profile) {
  document.querySelector("h2").textContent = profile.name;
  document.querySelector("p.description").textContent = profile.description;
  const imgElem = document.querySelector("img");
  imgElem.src = profile.img;
  imgElem.alt = `${profile.name}的大頭照`;
} else {
  document.querySelector(".profile").innerHTML = "<p>找不到此使用者資料。</p>";
}
