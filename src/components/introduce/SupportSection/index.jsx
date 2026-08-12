"use client";

import { useState } from "react";
import styles from "./SupportSection.module.scss";

export default function SupportSection() {
  const [searchText, setSearchText] = useState("");
  const [searched, setSearched] = useState(false);

  return (
    <section id="support" className={`${styles.section} ${styles.supportSection}`}>
      <div className={styles.inner}>
        <div className={styles.sectionTitle}>
          <span className={`body-xm`}>03</span>

          <div>
            <p className={`body-m-plus`}>CUSTOMER CENTER</p>
            <h2 className={`heading-s`}>고객센터</h2>
          </div>
        </div>

        <div className={styles.supportLayout}>
          <div className={styles.supportCards}>
            <article>
              <span>🎧</span>
              <h3>1:1 문의하기</h3>
              <p>궁금한 내용을 남겨주세요.</p>
            </article>

            <article>
              <span>💬</span>
              <h3>채팅 상담</h3>
              <p>빠르게 상담을 받아보세요.</p>
            </article>

            <article>
              <span>📞</span>
              <h3>전화 상담</h3>
              <p>평일 09:00 - 18:00</p>
            </article>

            <article>
              <span>✉️</span>
              <h3>이메일 문의</h3>
              <p>24시간 접수할 수 있어요.</p>
            </article>
          </div>

          <div className={styles.helpBox}>
            <span>HELP CENTER</span>

            <h3 className="body-l">
              빠른 도움이
              <br />
              필요하신가요?
            </h3>

            <p className="body-m">궁금한 내용을 검색해보세요.</p>

            <div className={styles.searchBox}>
              <input
                className="body-m"
                type="text"
                placeholder="검색어를 입력해주세요."
                value={searchText}
                onChange={(e) => {
                  setSearchText(e.target.value);
                  setSearched(false);
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && searchText.trim()) {
                    setSearched(true);
                  }
                }}
              />

              <button
                type="button"
                onClick={() => {
                  if (searchText.trim()) {
                    setSearched(true);
                  }
                }}
              >
                ⌕
              </button>
            </div>

            {searched && <p className={styles.searchResult}>“{searchText}”에 대한 도움말을 찾았어요.</p>}

            <div className={styles.tags}>
              <button type="button" onClick={() => setSearchText("계정")}>
                #계정
              </button>

              <button type="button" onClick={() => setSearchText("챌린지")}>
                #챌린지
              </button>

              <button type="button" onClick={() => setSearchText("AI 분석")}>
                #AI 분석
              </button>

              <button type="button" onClick={() => setSearchText("친구초대")}>
                #친구초대
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
