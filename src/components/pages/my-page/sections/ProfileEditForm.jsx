"use client";

import { useRef, useState } from "react";
import styles from "../MyPage.module.scss";

export default function ProfileEditForm({ initialProfile, onClose, onSave }) {
  const fileInputRef = useRef(null);
  const [image, setImage] = useState(initialProfile.image ?? "");
  const [nickname, setNickname] = useState(initialProfile.nickname ?? "");
  const [email, setEmail] = useState(initialProfile.email ?? "");
  const [phone, setPhone] = useState(initialProfile.phone ?? "");
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showPasswordConfirm, setShowPasswordConfirm] = useState(false);
  const [notification, setNotification] = useState(
    initialProfile.notification ?? false,
  );
  const [error, setError] = useState("");
  const [showValidation, setShowValidation] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const handleReset = () => {
    setImage("");
    setNickname("");
    setEmail("");
    setPhone("");
    setPassword("");
    setPasswordConfirm("");
    setShowPassword(false);
    setShowPasswordConfirm(false);
    setNotification(false);
    setError("");
    setShowValidation(false);

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleImageChange = (event) => {
    const file = event.target.files?.[0];

    if (file) {
      setImage(URL.createObjectURL(file));
    }
  };

  const handlePhoneChange = (event) => {
    setPhone(event.target.value.replace(/\D/g, "").slice(0, 11));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setShowValidation(true);

    if (password !== passwordConfirm) {
      setError("비밀번호가 일치하지 않습니다.");
      return;
    }

    setError("");
    setIsSaving(true);
    try {
      await onSave({ ...initialProfile, image, nickname, email, phone, password, notification });
    } catch (saveError) {
      setError(saveError.message || "저장하지 못했습니다.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <aside className={styles.editPanel} aria-label="정보 수정">
      <form
        className={`${styles.editForm} ${
          showValidation ? styles.showValidation : ""
        }`}
        onSubmit={handleSubmit}
        onInvalid={() => setShowValidation(true)}
      >
        <header className={styles.editHeader}>
          <button type="button" aria-label="닫기" onClick={onClose}>
            <span className="material-icons">close</span>
          </button>

          <h2 className="body-m-plus">정보 수정</h2>

          <button
            type="button"
            aria-label="입력 내용 초기화"
            onClick={handleReset}
          >
            <span className="material-icons">history</span>
          </button>
        </header>

        <section className={styles.editImageSection}>
          <h3 className="caption-plus">이미지</h3>
          <div className={styles.editImageControl}>
            <div className={styles.editImagePreview}>
              {image && <img src={image} alt="" />}
            </div>
            <input
              ref={fileInputRef}
              id="profileImage"
              type="file"
              accept="image/*"
              onChange={handleImageChange}
            />
            <label htmlFor="profileImage" className="caption">
              변경
            </label>
          </div>
        </section>

        <div className={styles.editFields}>
          <label className={styles.editField}>
            <span className="caption-plus">닉네임</span>
            <input
              type="text"
              value={nickname}
              required
              onChange={(event) => setNickname(event.target.value)}
            />
          </label>

          <label className={styles.editField}>
            <span className="caption-plus">이메일</span>
            <input
              type="email"
              value={email}
              placeholder="example@email.com"
              onChange={(event) => setEmail(event.target.value)}
            />
          </label>

          <label className={styles.editField}>
            <span className="caption-plus">전화번호</span>
            <input
              type="tel"
              inputMode="numeric"
              maxLength={11}
              pattern="010[0-9]{8}"
              title="010으로 시작하는 휴대전화 번호 11자리를 입력해주세요."
              value={phone}
              placeholder="01012345678"
              onChange={handlePhoneChange}
            />
          </label>

          <label className={`${styles.editField} ${styles.createdAtField}`}>
            <span className="caption-plus">가입 날짜</span>
            <input
              type="text"
              value={initialProfile.createdAt ?? ""}
              disabled
            />
          </label>

          <div className={styles.editPasswordGroup}>
            <span className="caption-plus">비밀번호 수정</span>

            <label className={styles.editPasswordField}>
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                placeholder="새 비밀번호"
                minLength={5}
                pattern="(?=.*[a-z])(?=.*[^A-Za-z0-9]).{5,}"
                title="5글자 이상이며 소문자와 특수기호를 포함해야 합니다."
                onChange={(event) => setPassword(event.target.value)}
              />
              <button
                type="button"
                className={showPassword ? styles.visible : ""}
                aria-label={showPassword ? "비밀번호 숨기기" : "비밀번호 보기"}
                onClick={() => setShowPassword((value) => !value)}
              >
                <span className="material-icons">
                  {showPassword ? "visibility" : "visibility_off"}
                </span>
              </button>
            </label>

            <label
              className={`${styles.editPasswordField} ${
                showValidation &&
                passwordConfirm &&
                password !== passwordConfirm
                  ? styles.passwordMismatch
                  : ""
              }`}
            >
              <input
                type={showPasswordConfirm ? "text" : "password"}
                value={passwordConfirm}
                placeholder="새 비밀번호 확인"
                onChange={(event) => setPasswordConfirm(event.target.value)}
              />
              <button
                type="button"
                className={showPasswordConfirm ? styles.visible : ""}
                aria-label={
                  showPasswordConfirm ? "비밀번호 숨기기" : "비밀번호 보기"
                }
                onClick={() => setShowPasswordConfirm((value) => !value)}
              >
                <span className="material-icons">
                  {showPasswordConfirm ? "visibility" : "visibility_off"}
                </span>
              </button>
            </label>
          </div>

          <div className={styles.editNotificationRow}>
            <div className={styles.editNotificationLabel}>
              <span className="caption-plus">알림 설정</span>
              <button
                type="button"
                className={styles.editHelp}
                aria-label="알림 설정 안내"
              >
                <span className="material-icons">help</span>
                <span className={styles.editTooltip}>
                  저축 일정, 목표 달성 현황과 챌린지 순위
                  <br />
                  변동을 알림으로 알려드려요.
                </span>
              </button>
            </div>

            <div className={styles.editNotificationControl}>
              <span className="caption-plus">
                {notification ? "켬" : "꺼짐"}
              </span>
              <button
                type="button"
                className={`${styles.editToggle} ${notification ? styles.on : ""}`}
                role="switch"
                aria-checked={notification}
                onClick={() => setNotification((value) => !value)}
              >
                <span />
              </button>
            </div>
          </div>
        </div>

        {error && <p className={styles.editError}>{error}</p>}

        <button type="submit" disabled={isSaving} className={`${styles.editSaveButton} body-m`}>
          {isSaving ? "저장 중..." : "저장하기"}
        </button>
      </form>
    </aside>
  );
}
