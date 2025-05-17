import React, { useState } from "react";
import "../App.css";
import "./base.css";
import "./home.css";
import { useAuth } from "../login/AuthContext";
import { Link, useNavigate } from "react-router-dom"; // 這裡補上 useNavigate

const profiles = [
  {
    id: 1,
    name: "小美",
    gender: "女",
    description: "愛好旅行、喜歡貓咪、喜歡甜點。",
    img: "小美.jpg",
  },
  {
    id: 2,
    name: "小明",
    gender: "男",
    description: "熱愛籃球、喜歡科技新知、擅長烹飪。",
    img: "小明.jpg",
  },
  {
    id: 3,
    name: "小華",
    gender: "男",
    description: "愛攝影、熱愛健身、旅行愛好者。",
    img: "小華.jpg",
  },
];

function Home() {
  const [searchText, setSearchText] = useState("");
  const { user, logout } = useAuth(); // 刪掉沒用的 login
  const navigate = useNavigate();

  const filteredProfiles = profiles.filter(
    (profile) =>
      profile.name.includes(searchText) ||
      profile.description.includes(searchText)
  );

  return (
    <div>
      <header>
        <h1>交友平台</h1>

        <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <input
            type="text"
            id="searchInput"
            placeholder="搜尋名字或介紹..."
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            style={{ flex: 1, marginRight: "10px" }}
          />

          {user ? (
            <div>
              <span style={{ marginRight: "15px" }}>歡迎，{user.username}</span>
              <button
                className="logout-button"
                onClick={() => {
                  logout();
                  navigate("/login");
                }}
              >
                登出
              </button>
            </div>
          ) : (
            <button onClick={() => navigate("/login")}>登入</button>
          )}
        </div>
      </header>

      <main>
        <div className="card-container" id="cardContainer">
          {filteredProfiles.map((profile) => (
            <Link key={profile.id} to={`/profile/${profile.id}`}>
              <div className="profile-card">
                <img src={profile.img} alt={`${profile.name}的大頭照`} />
                <h2>{profile.name}</h2>
                <p className="gender">性別：{profile.gender}</p>
                <p className="description">{profile.description}</p>
              </div>
            </Link>
          ))}
          {filteredProfiles.length === 0 && (
            <p style={{ textAlign: "center", color: "#888" }}>
              找不到符合的結果
            </p>
          )}
        </div>
      </main>
    </div>
  );
}

export default Home;
