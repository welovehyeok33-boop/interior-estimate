"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: { email?: string; password?: string } = {};
    if (!/^\S+@\S+$/.test(email)) newErrors.email = "이메일 형식을 확인해주세요";
    if (password.length < 6) newErrors.password = "비밀번호는 6자 이상이어야 합니다";
    if (Object.keys(newErrors).length > 0) { setErrors(newErrors); return; }
    // TODO: Supabase 연동
    router.push("/");
  };

  return (
    <div style={{ minHeight: "100vh", background: "#FFFDF0", display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
      <div style={{ width: "100%", maxWidth: 420 }}>
        <div style={{ textAlign: "center", marginBottom: 32, cursor: "pointer" }} onClick={() => router.push("/")}>
          <Image src="/logo.png" alt="폼잇." width={36} height={36} style={{ borderRadius: 8, marginBottom: 8 }} />
          <div style={{ fontWeight: 800, fontSize: 18, color: "#111", letterSpacing: "-0.5px" }}>폼잇.</div>
        </div>

        <div style={{ background: "#fff", border: "1px solid #E8E8E8", borderRadius: 16, padding: "36px 32px", boxShadow: "0 4px 24px rgba(0,0,0,0.06)" }}>
          <h1 style={{ fontSize: 24, fontWeight: 800, color: "#111", margin: "0 0 6px", letterSpacing: "-0.5px" }}>로그인</h1>
          <p style={{ fontSize: 14, color: "#888", margin: "0 0 28px" }}>
            계정이 없으신가요?{" "}
            <Link href="/signup" style={{ color: "#111", fontWeight: 700, textDecoration: "none" }}>무료 회원가입</Link>
          </p>

          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div>
              <label style={{ fontSize: 13, fontWeight: 600, color: "#333", display: "block", marginBottom: 6 }}>이메일</label>
              <input
                type="email" value={email} onChange={e => setEmail(e.target.value)}
                placeholder="example@email.com"
                style={{ width: "100%", padding: "11px 14px", borderRadius: 8, border: `1px solid ${errors.email ? "#ef4444" : "#e0e0e0"}`, fontSize: 14, outline: "none", boxSizing: "border-box", fontFamily: "inherit" }}
              />
              {errors.email && <p style={{ fontSize: 12, color: "#ef4444", margin: "4px 0 0" }}>{errors.email}</p>}
            </div>
            <div>
              <label style={{ fontSize: 13, fontWeight: 600, color: "#333", display: "block", marginBottom: 6 }}>비밀번호</label>
              <input
                type="password" value={password} onChange={e => setPassword(e.target.value)}
                placeholder="비밀번호를 입력하세요"
                style={{ width: "100%", padding: "11px 14px", borderRadius: 8, border: `1px solid ${errors.password ? "#ef4444" : "#e0e0e0"}`, fontSize: 14, outline: "none", boxSizing: "border-box", fontFamily: "inherit" }}
              />
              {errors.password && <p style={{ fontSize: 12, color: "#ef4444", margin: "4px 0 0" }}>{errors.password}</p>}
            </div>
            <div style={{ textAlign: "right" }}>
              <Link href="#" style={{ fontSize: 13, color: "#aaa", textDecoration: "none" }}>비밀번호를 잊으셨나요?</Link>
            </div>
            <button type="submit" style={{ padding: "13px", borderRadius: 8, background: "#111", color: "#fff", fontWeight: 700, fontSize: 15, border: "none", cursor: "pointer", fontFamily: "inherit" }}>
              로그인
            </button>

            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <div style={{ flex: 1, height: 1, background: "#f0f0f0" }} />
              <span style={{ fontSize: 12, color: "#bbb" }}>또는</span>
              <div style={{ flex: 1, height: 1, background: "#f0f0f0" }} />
            </div>

            <button type="button" style={{ padding: "12px", borderRadius: 8, background: "#fff", border: "1px solid #e0e0e0", fontWeight: 600, fontSize: 14, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 10, fontFamily: "inherit" }}>
              <svg width="18" height="18" viewBox="0 0 18 18">
                <path fill="#4285F4" d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.874 2.684-6.615z"/>
                <path fill="#34A853" d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.258c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332C2.438 15.983 5.482 18 9 18z"/>
                <path fill="#FBBC05" d="M3.964 10.707c-.18-.54-.282-1.117-.282-1.707s.102-1.167.282-1.707V4.961H.957C.347 6.175 0 7.55 0 9s.348 2.825.957 4.039l3.007-2.332z"/>
                <path fill="#EA4335" d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0 5.482 0 2.438 2.017.957 4.961L3.964 7.293C4.672 5.166 6.656 3.58 9 3.58z"/>
              </svg>
              Google로 로그인
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
