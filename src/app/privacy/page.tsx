import Link from "next/link";
import TrafficPreference from '@/components/TrafficPreference';

export default function PrivacyPage() {
  return <main style={{ maxWidth: 680, margin: "0 auto", padding: "40px 24px", lineHeight: 1.9 }}>
    <Link href="/">폼잇 홈</Link>
    <h1>개인정보 수집·이용 안내</h1>
    <p>폼잇은 무료 견적 상담 신청을 위해 아래 정보를 처리합니다. 적용일: 2026년 9월 29일</p>
    <h2>수집 항목과 목적</h2>
    <p>이름, 전화번호, 지역, 공간 유형·업종, 면적, 공사 시기, 희망 예산, 선택적으로 작성한 공간 설명과 요청 내용을 수집합니다. 신청 접수와 견적 상담 연락에 이용합니다.</p>
    <h2>보유 기간</h2>
    <p>새로 접수한 상담 정보는 접수일로부터 최대 90일 보관한 뒤 삭제합니다. 개인정보를 별도 광고 목적으로 사용하거나 협력업체에 자동 공개하지 않습니다.</p>
    <h2>동의와 권리</h2>
    <p>동의를 거부할 수 있으나 연락처가 필요한 상담 신청은 이용하기 어렵습니다. 상담 담당자에게 정보 열람·정정·삭제 또는 동의 철회를 요청할 수 있습니다.</p>
    <h2>처리와 보호</h2>
    <TrafficPreference />
    <p>방문 및 신청 흐름 통계를 위해 한국시간 당일 자정까지 유효한 임의의 브라우저 식별 쿠키를 사용합니다. 통계에는 날짜별로 바뀌는 식별값과 상담·상세견적 진입 여부, 신청 완료 여부를 기록합니다. 원본 IP, 검색어, 페이지 입력 내용은 방문 통계에 저장하지 않습니다. 브라우저의 추적 거부(Do Not Track 또는 Global Privacy Control) 설정으로 방문 집계를 거부할 수 있습니다.</p>
    <p>서비스 운영을 위해 Vercel에서 웹 요청을 처리하고 Supabase 데이터베이스에 신청 정보를 보관합니다. 신청 정보는 인증된 관리자만 조회할 수 있도록 접근을 제한합니다.</p>
  </main>;
}
