import React from "react";
import { useParams } from "react-router-dom";
import "../App.css";
import "./base.css";
import "./profile.css";

// 假資料（可以改成從後端 API 抓）
const profiles = {
  1: {
    name: "小美",
    img: "小美.jpg",
    description: "愛好旅行、喜歡貓咪、喜歡甜點。",
  },
  2: {
    name: "小明",
    img: "小明.jpg",
    description: "熱愛籃球、喜歡科技新知、擅長烹飪。",
  },
  3: {
    name: "小華",
    img: "小華.jpg",
    description: "愛攝影、熱愛健身、旅行愛好者。",
  },
};

function Profile() {
  const { id } = useParams();
  const profile = profiles[id];

  if (!profile) {
    return <p>找不到此用戶</p>;
  }

  return (
    <div>
      <header>
        <h1>交友平台</h1>
        <input type="text" id="searchInput" placeholder="搜尋名字或介紹..." />
      </header>

      <div className="main">
        <article className="profile">
          <figure className="photo">
            <img src={profile.img} alt={`${profile.name}的大頭照`} />
          </figure>
          <div className="info">
            <h2>{profile.name}</h2>
            <p className="description">{profile.description}</p>
          </div>
        </article>
      </div>
    </div>
  );
}

export default Profile;
