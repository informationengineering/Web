import React, { useState, useEffect } from "react";
import { useAuth } from "./login";
import { useNavigate } from "react-router-dom";
import apiRequest from './utils/api';

function ProfilePage() {
  const { user, updateUser, apiRequest } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    gender: "",
    email: "",
    description: "",
    intro: "",
    account: "",
    password: "",
    imageData: "",
  });
  const [originalData, setOriginalData] = useState(null); // 新增：儲存原始資料
  const [isEditing, setIsEditing] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // 載入用戶完整資料
  useEffect(() => {
    const loadUserData = async () => {
      if (!user) return;
      try {
        const response = await apiRequest(`/users/${user.id}`);
        if (response.ok) {
          const userData = await response.json();
          const newFormData = {
            name: userData.name || "",
            gender: userData.gender || "",
            email: userData.email || "",
            description: userData.description || "",
            intro: userData.intro || "",
            account: user.account || "",
            password: "",
            imageData: userData.image_url || "",
          };
          setFormData(newFormData);
          setOriginalData(newFormData); // 儲存原始資料
        }
      } catch (error) {
        console.error('載入用戶資料失敗:', error);
        setErrorMsg('載入資料失敗');
      }
    };
    loadUserData();
  }, [user, apiRequest]);

  if (!user) return <p>請先登入</p>;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // 取消編輯時恢復原始資料
  const handleCancel = () => {
    setFormData(originalData);
    setIsEditing(false);
  };

  const handleSave = async () => {
    setErrorMsg("");
    setSuccessMsg("");
    setIsLoading(true);

    try {
      const response = await apiRequest(`/users/${user.id}`, {
        method: "PUT",
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || '更新失敗');
      }

      const updatedUser = await response.json();
      updateUser(updatedUser);
      setIsEditing(false);
      setSuccessMsg("資料更新成功！");
      setOriginalData(formData); // 儲存成功後，原始資料也更新
      setFormData((prev) => ({ ...prev, password: "" }));
    } catch (error) {
      setErrorMsg(error.message || "更新失敗，請稍後再試");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: 600, margin: "20px auto", padding: 20, border: "1px solid #ccc", borderRadius: 8 }}>
      <h2>個人主頁</h2>

      <div style={{ marginBottom: 20, textAlign: "center" }}>
        {formData.imageData ? (
          <img
            src={formData.imageData}
            alt="個人照片"
            style={{ maxWidth: 200, maxHeight: 200, borderRadius: "50%", objectFit: "cover" }}
            onError={(e) => {
              e.target.src = '/default-avatar.png';
            }}
          />
        ) : (
          <div style={{ 
            width: 200, 
            height: 200, 
            borderRadius: "50%", 
            backgroundColor: "#ccc", 
            lineHeight: "200px", 
            textAlign: "center",
            margin: "0 auto"
          }}>
            無照片
          </div>
        )}
      </div>

      <div style={{ marginBottom: 12 }}>
        <strong>姓名：</strong>{" "}
        {isEditing ? (
          <input 
            name="name" 
            value={formData.name} 
            onChange={handleChange}
            required
          />
        ) : (
          formData.name
        )}
      </div>

      <div style={{ marginBottom: 12 }}>
        <strong>性別：</strong>{" "}
        {isEditing ? (
          <select name="gender" value={formData.gender} onChange={handleChange}>
            <option value="">未填寫</option>
            <option value="男">男</option>
            <option value="女">女</option>
            <option value="其他">其他</option>
          </select>
        ) : (
          formData.gender || "未填寫"
        )}
      </div>

      <div style={{ marginBottom: 12 }}>
        <strong>Email：</strong>{" "}
        {isEditing ? (
          <input 
            name="email" 
            type="email"
            value={formData.email} 
            onChange={handleChange} 
          />
        ) : (
          formData.email || "未填寫"
        )}
      </div>

      <div style={{ marginBottom: 12 }}>
        <strong>描述：</strong>{" "}
        {isEditing ? (
          <textarea 
            name="description" 
            value={formData.description} 
            onChange={handleChange} 
            rows={3}
            style={{ width: "100%" }}
          />
        ) : (
          formData.description || "無"
        )}
      </div>

      <div style={{ marginBottom: 12 }}>
        <strong>介紹：</strong>{" "}
        {isEditing ? (
          <textarea 
            name="intro" 
            value={formData.intro} 
            onChange={handleChange} 
            rows={3}
            style={{ width: "100%" }}
          />
        ) : (
          formData.intro || "無"
        )}
      </div>

      <div style={{ marginBottom: 12 }}>
        <strong>帳號：</strong>{" "}
        {isEditing ? (
          <input 
            name="account" 
            value={formData.account} 
            onChange={handleChange}
            required
          />
        ) : (
          formData.account || "****"
        )}
      </div>

      <div style={{ marginBottom: 12 }}>
        <strong>密碼：</strong>{" "}
        {isEditing ? (
          <input
            name="password"
            type="password"
            placeholder="留空表示不修改密碼"
            value={formData.password}
            onChange={handleChange}
          />
        ) : (
          "****"
        )}
      </div>

      <div style={{ marginBottom: 12 }}>
        <strong>圖片網址：</strong>{" "}
        {isEditing ? (
          <input 
            name="imageData" 
            value={formData.imageData} 
            onChange={handleChange}
            placeholder="圖片網址"
          />
        ) : (
          formData.imageData || "無"
        )}
      </div>

      {errorMsg && <p style={{ color: "red" }}>{errorMsg}</p>}
      {successMsg && <p style={{ color: "green" }}>{successMsg}</p>}

      <div style={{ marginTop: 20 }}>
        <button onClick={() => navigate('/')} style={{ marginRight: 10 }}>
          ← 返回首頁
        </button>

        <button 
          onClick={isEditing ? handleCancel : () => setIsEditing(true)}
          style={{ marginRight: 10 }}
          disabled={isLoading}
        >
          ⚙️ {isEditing ? "取消" : "編輯資料"}
        </button>

        {isEditing && (
          <button 
            onClick={handleSave} 
            style={{ 
              backgroundColor: "#384aa5", 
              color: "white", 
              padding: "5px 15px", 
              border: "none", 
              borderRadius: 4 
            }}
            disabled={isLoading}
          >
            {isLoading ? "儲存中..." : "儲存"}
          </button>
        )}
      </div>
    </div>
  );
}

export default ProfilePage;


/*import React, { useState, useEffect } from "react";
import { useAuth } from "./login";
import { useNavigate } from "react-router-dom";

function ProfilePage() {
  const { user, updateUser, apiRequest } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    gender: "",
    email: "",
    description: "",
    intro: "",
    account: "",
    password: "",
    imageData: "",
  });
  const [isEditing, setIsEditing] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // 載入用戶完整資料
  useEffect(() => {
    const loadUserData = async () => {
      if (!user) return;
      
      try {
        const response = await apiRequest(`/users/${user.id}`);
        if (response.ok) {
          const userData = await response.json();
          setFormData({
            name: userData.name || "",
            gender: userData.gender || "",
            email: userData.email || "",
            description: userData.description || "",
            intro: userData.intro || "",
            account: user.account || "",
            password: "",
            imageData: userData.image_url || "",
          });
        }
      } catch (error) {
        console.error('載入用戶資料失敗:', error);
        setErrorMsg('載入資料失敗');
      }
    };

    loadUserData();
  }, [user, apiRequest]);

  if (!user) return <p>請先登入</p>;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    setErrorMsg("");
    setSuccessMsg("");
    setIsLoading(true);

    try {
      const response = await apiRequest(`/users/${user.id}`, {
        method: "PUT",
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || '更新失敗');
      }

      const updatedUser = await response.json();
      updateUser(updatedUser);
      setIsEditing(false);
      setSuccessMsg("資料更新成功！");
      setFormData((prev) => ({ ...prev, password: "" }));
    } catch (error) {
      setErrorMsg(error.message || "更新失敗，請稍後再試");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: 600, margin: "20px auto", padding: 20, border: "1px solid #ccc", borderRadius: 8 }}>
      <h2>個人主頁</h2>

      <div style={{ marginBottom: 20, textAlign: "center" }}>
        {formData.imageData ? (
          <img
            src={formData.imageData}
            alt="個人照片"
            style={{ maxWidth: 200, maxHeight: 200, borderRadius: "50%", objectFit: "cover" }}
            onError={(e) => {
              e.target.src = '/default-avatar.png';
            }}
          />
        ) : (
          <div style={{ 
            width: 200, 
            height: 200, 
            borderRadius: "50%", 
            backgroundColor: "#ccc", 
            lineHeight: "200px", 
            textAlign: "center",
            margin: "0 auto"
          }}>
            無照片
          </div>
        )}
      </div>

      <div style={{ marginBottom: 12 }}>
        <strong>姓名：</strong>{" "}
        {isEditing ? (
          <input 
            name="name" 
            value={formData.name} 
            onChange={handleChange}
            required
          />
        ) : (
          formData.name
        )}
      </div>

      <div style={{ marginBottom: 12 }}>
        <strong>性別：</strong>{" "}
        {isEditing ? (
          <select name="gender" value={formData.gender} onChange={handleChange}>
            <option value="">未填寫</option>
            <option value="男">男</option>
            <option value="女">女</option>
            <option value="其他">其他</option>
          </select>
        ) : (
          formData.gender || "未填寫"
        )}
      </div>

      <div style={{ marginBottom: 12 }}>
        <strong>Email：</strong>{" "}
        {isEditing ? (
          <input 
            name="email" 
            type="email"
            value={formData.email} 
            onChange={handleChange} 
          />
        ) : (
          formData.email || "未填寫"
        )}
      </div>

      <div style={{ marginBottom: 12 }}>
        <strong>描述：</strong>{" "}
        {isEditing ? (
          <textarea 
            name="description" 
            value={formData.description} 
            onChange={handleChange} 
            rows={3}
            style={{ width: "100%" }}
          />
        ) : (
          formData.description || "無"
        )}
      </div>

      <div style={{ marginBottom: 12 }}>
        <strong>介紹：</strong>{" "}
        {isEditing ? (
          <textarea 
            name="intro" 
            value={formData.intro} 
            onChange={handleChange} 
            rows={3}
            style={{ width: "100%" }}
          />
        ) : (
          formData.intro || "無"
        )}
      </div>

      <div style={{ marginBottom: 12 }}>
        <strong>帳號：</strong>{" "}
        {isEditing ? (
          <input 
            name="account" 
            value={formData.account} 
            onChange={handleChange}
            required
          />
        ) : (
          formData.account || "****"
        )}
      </div>

      <div style={{ marginBottom: 12 }}>
        <strong>密碼：</strong>{" "}
        {isEditing ? (
          <input
            name="password"
            type="password"
            placeholder="留空表示不修改密碼"
            value={formData.password}
            onChange={handleChange}
          />
        ) : (
          "****"
        )}
      </div>

      <div style={{ marginBottom: 12 }}>
        <strong>圖片網址：</strong>{" "}
        {isEditing ? (
          <input 
            name="imageData" 
            value={formData.imageData} 
            onChange={handleChange}
            placeholder="圖片網址"
          />
        ) : (
          formData.imageData || "無"
        )}
      </div>

      {errorMsg && <p style={{ color: "red" }}>{errorMsg}</p>}
      {successMsg && <p style={{ color: "green" }}>{successMsg}</p>}

      <div style={{ marginTop: 20 }}>
        <button onClick={() => navigate('/')} style={{ marginRight: 10 }}>
          ← 返回首頁
        </button>

        <button 
          onClick={() => setIsEditing(!isEditing)} 
          style={{ marginRight: 10 }}
          disabled={isLoading}
        >
          ⚙️ {isEditing ? "取消" : "編輯資料"}
        </button>

        {isEditing && (
          <button 
            onClick={handleSave} 
            style={{ 
              backgroundColor: "#384aa5", 
              color: "white", 
              padding: "5px 15px", 
              border: "none", 
              borderRadius: 4 
            }}
            disabled={isLoading}
          >
            {isLoading ? "儲存中..." : "儲存"}
          </button>
        )}
      </div>
    </div>
  );
}

export default ProfilePage;*/