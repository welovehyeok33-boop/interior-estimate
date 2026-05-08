"use client";

import React from "react";
import {
  Box,
  Container,
  Card,
  Title,
  Text,
  Button,
  Stack,
  Group,
  SimpleGrid,
} from "@mantine/core";
import { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { IconArrowLeft, IconArrowRight, IconBuildingSkyscraper, IconTrain, IconMountain } from "@tabler/icons-react";

// 유형
const TYPES = [
  { id: "residential", label: "주거", icon: "🏠", desc: "아파트, 빌라, 단독주택" },
  { id: "commercial", label: "상가", icon: "🏢", desc: "상업공간, 오피스, 매장" },
];

// 주거 등급
const RESIDENTIAL_GRADES = [
  {
    id: "budget",
    label: "저렴하게",
    icon: "💰",
    desc: "실용적인 마감재 위주",
    detail: "기능 중심, 합리적인 비용",
    color: "#2e7d32",
    bg: "#f1f8e9",
    border: "#a5d6a7",
  },
  {
    id: "standard",
    label: "스탠다드",
    icon: "⭐",
    desc: "품질과 비용의 균형",
    detail: "가장 많이 선택하는 옵션",
    color: "#1565c0",
    bg: "#e8f0fe",
    border: "#90caf9",
  },
  {
    id: "highend",
    label: "하이앤드",
    icon: "💎",
    desc: "프리미엄 자재 & 마감",
    detail: "고급 브랜드 제품 적용",
    color: "#6a1b9a",
    bg: "#f3e5f5",
    border: "#ce93d8",
  },
];

// 상가 세부 유형
const COMMERCIAL_TYPES = [
  { id: "food", label: "외식", icon: "🍽️", subs: ["식당", "카페"] },
  { id: "office", label: "오피스", icon: "💼", subs: ["일반 오피스", "공유오피스", "1인 오피스"] },
  { id: "education", label: "교육", icon: "📚", subs: ["학원", "스터디카페", "유치원/학교"] },
  { id: "medical", label: "의료", icon: "🏥", subs: ["병원", "동물병원", "약국"] },
  { id: "accommodation", label: "숙박", icon: "🛏️", subs: ["고시원", "호스텔", "모텔/호텔", "에어비앤비"] },
  { id: "fitness", label: "피트니스/엔터", icon: "🎯", subs: ["헬스장", "필라테스/요가", "골프연습장", "PC방", "노래방"] },
  { id: "beauty", label: "뷰티", icon: "💅", subs: ["뷰티샵"] },
  { id: "retail", label: "리테일", icon: "🛍️", subs: ["편의점", "의류/잡화점"] },
  { id: "etc", label: "기타", icon: "📋", subs: [] },
];

const REGIONS = [
  { id: "seoul", label: "서울", desc: "서울특별시 전체" },
  { id: "metro", label: "수도권", desc: "경기 · 인천" },
  { id: "local", label: "지방", desc: "그 외 지역" },
];

const REGION_ICONS: Record<string, React.ReactNode> = {
  seoul: <IconBuildingSkyscraper size={28} strokeWidth={1.5} />,
  metro: <IconTrain size={28} strokeWidth={1.5} />,
  local: <IconMountain size={28} strokeWidth={1.5} />,
};

const TOTAL_STEPS = 5;
const CURRENT_STEP = 1;

// 비행 경로
function FlightPath({ step, totalSteps }: { step: number; totalSteps: number }) {
  const progress = (step / totalSteps) * 100;
  const t = progress / 100;
  const x = (1 - t) * (1 - t) * 10 + 2 * (1 - t) * t * 155 + t * t * 300;
  const y = (1 - t) * (1 - t) * 65 + 2 * (1 - t) * t * 25 + t * t * 65;
  const dx = 2 * (1 - t) * (155 - 10) + 2 * t * (300 - 155);
  const dy = 2 * (1 - t) * (25 - 65) + 2 * t * (65 - 25);
  const angle = Math.atan2(dy, dx) * (180 / Math.PI);
  const isLanded = step >= totalSteps;

  // 단계 체크포인트 위치
  const checkpoints = Array.from({ length: totalSteps }, (_, i) => {
    const ct = (i + 1) / totalSteps;
    return {
      x: (1 - ct) * (1 - ct) * 10 + 2 * (1 - ct) * ct * 155 + ct * ct * 300,
      y: (1 - ct) * (1 - ct) * 65 + 2 * (1 - ct) * ct * 25 + ct * ct * 65,
      done: i + 1 <= step,
    };
  });

  return (
    <Box style={{ width: "100%", padding: "0 12px" }}>
      <svg viewBox="0 0 320 110" style={{ width: "100%", height: 130, overflow: "visible" }}>
        {/* 배경 경로 */}
        <path d="M 10 65 Q 155 25 300 65" fill="none" stroke="#d0e4ff" strokeWidth="2" strokeDasharray="6 4" />
        {/* 진행 경로 */}
        <path
          d="M 10 65 Q 155 25 300 65"
          fill="none"
          stroke="#1565c0"
          strokeWidth="2.5"
          strokeDasharray={`${t * 330} 999`}
          strokeLinecap="round"
          style={{ transition: "stroke-dasharray 0.6s cubic-bezier(0.4,0,0.2,1)" }}
        />
        {/* 출발 */}
        <circle cx="10" cy="65" r="5" fill="#1565c0" />
        <text x="10" y="85" textAnchor="middle" fontSize="8.5" fill="#1565c0" fontWeight="600">출발</text>

        {/* 단계 체크포인트 (1단계~4단계만, 5단계=견적완성) */}
        {checkpoints.slice(0, totalSteps - 1).map((cp, i) => (
          <g key={i}>
            <circle
              cx={cp.x}
              cy={cp.y}
              r="4"
              fill={cp.done ? "#1565c0" : "white"}
              stroke={cp.done ? "#1565c0" : "#d0e4ff"}
              strokeWidth="1.5"
              style={{ transition: "all 0.4s ease" }}
            />
            <text
              x={cp.x}
              y={85}
              textAnchor="middle"
              fontSize="8"
              fill={cp.done ? "#1565c0" : "#bbb"}
              fontWeight={cp.done ? "700" : "400"}
            >
              {i + 1}단계
            </text>
          </g>
        ))}

        {/* 목적지 */}
        <circle cx="300" cy="65" r="5" fill={isLanded ? "#1565c0" : "white"} stroke={isLanded ? "#1565c0" : "#d0e4ff"} strokeWidth="1.5" style={{ transition: "all 0.4s ease" }} />
        <text x="300" y="85" textAnchor="middle" fontSize="8.5" fill={isLanded ? "#1565c0" : "#bbb"} fontWeight="600">
          견적완성
        </text>

        {/* 비행기 */}
        <g
          transform={`translate(${x}, ${y}) rotate(${angle})`}
          style={{ transition: "transform 0.6s cubic-bezier(0.4,0,0.2,1)" }}
        >
          {/* 동체 */}
          <ellipse cx="0" cy="0" rx="13" ry="3.2" fill="#1565c0" />
          {/* 기수 */}
          <ellipse cx="13" cy="0" rx="4" ry="2" fill="#1a78d4" />
          {/* 꼬리 */}
          <ellipse cx="-13" cy="0" rx="3" ry="1.8" fill="#0d47a1" />

          {/* 주날개 (왼쪽) */}
          <path d="M 2,0 L -4,-13 L -8,-12 L -3,0 Z" fill="#1976d2" />
          {/* 주날개 (오른쪽) */}
          <path d="M 2,0 L -4,13 L -8,12 L -3,0 Z" fill="#1976d2" />

          {/* 꼬리날개 (왼쪽) */}
          <path d="M -10,0 L -14,-6 L -15,-5.5 L -11,0 Z" fill="#1565c0" />
          {/* 꼬리날개 (오른쪽) */}
          <path d="M -10,0 L -14,6 L -15,5.5 L -11,0 Z" fill="#1565c0" />
          {/* 수직꼬리날개 */}
          <path d="M -10,0 L -15,-5 L -14,0 Z" fill="#0d47a1" />

          {/* 엔진 왼쪽 */}
          <ellipse cx="-1" cy="-8" rx="4" ry="1.8" fill="#0d47a1" />
          <ellipse cx="1" cy="-8" rx="2" ry="1.8" fill="#1a78d4" />
          {/* 엔진 오른쪽 */}
          <ellipse cx="-1" cy="8" rx="4" ry="1.8" fill="#0d47a1" />
          <ellipse cx="1" cy="8" rx="2" ry="1.8" fill="#1a78d4" />

          {/* 창문 */}
          <circle cx="6" cy="-1" r="1" fill="rgba(255,255,255,0.7)" />
          <circle cx="3" cy="-1" r="1" fill="rgba(255,255,255,0.7)" />
          <circle cx="0" cy="-1" r="1" fill="rgba(255,255,255,0.7)" />
        </g>

        {/* 진행 퍼센트 */}
        <text
          x={x}
          y={y - 16}
          textAnchor="middle"
          fontSize="10"
          fill="#1565c0"
          fontWeight="700"
          style={{ transition: "all 0.6s ease" }}
        >
          {Math.round(progress)}%
        </text>
      </svg>

      {/* 단계 텍스트 */}
      <Text ta="center" size="xs" c="gray.5" mt={-4}>
        {step} / {totalSteps} 단계 완료
      </Text>
    </Box>
  );
}

export default function DetailEstimatePage() {
  const router = useRouter();

  const [region, setRegion] = useState<string | null>(null);
  const [type, setType] = useState<string | null>(null);
  const [commercialType, setCommercialType] = useState<string | null>(null);
  const [commercialSub, setCommercialSub] = useState<string | null>(null);
  const [residentialGrade, setResidentialGrade] = useState<string | null>(null);

  // 진행률 계산
  const progress = (() => {
    let score = 0;
    if (region) score += 25;
    if (type) score += 25;
    if (type === "commercial" && commercialType) score += 50;
    if (type === "residential" && residentialGrade) score += 50;
    return Math.min(score, 100);
  })();

  const selectedCommercial = COMMERCIAL_TYPES.find(c => c.id === commercialType);
  const hasSubs = selectedCommercial && selectedCommercial.subs.length > 0;

  const canNext = type === "residential"
    ? !!region && !!residentialGrade
    : !!region && !!commercialType && (!hasSubs || !!commercialSub);


  return (
    <Box style={{ minHeight: "100vh", background: "#f0f6ff" }}>
      {/* 헤더 */}
      <Box style={{ background: "linear-gradient(135deg, #0a2a6e, #1565c0)", padding: "14px 0" }}>
        <Container size="lg">
          <Group justify="space-between">
            <Group gap={8} style={{ cursor: "pointer" }} onClick={() => router.push("/")}>
              <Image src="/logo.png" alt="인테리어허브" width={30} height={30} style={{ borderRadius: 6 }} />
              <Text fw={800} size="lg" c="white">인테리어허브</Text>
            </Group>
            <Text size="sm" c="rgba(255,255,255,0.7)">AI 세부 견적 · 1단계</Text>
          </Group>
        </Container>
      </Box>

      <Container size="sm" py={32}>

        {/* 비행 경로 */}
        <Card radius="xl" p="lg" mb="lg" style={{ background: "white", boxShadow: "0 4px 24px rgba(21,101,192,0.10)" }}>
          <Text size="xs" c="gray.5" fw={600} mb={4} tt="uppercase" style={{ letterSpacing: "0.08em" }}>
            견적 진행도
          </Text>
          <FlightPath step={CURRENT_STEP} totalSteps={TOTAL_STEPS} />
        </Card>

        {/* 폼 카드 */}
        <Card radius="xl" p="xl" style={{ background: "white", boxShadow: "0 4px 24px rgba(21,101,192,0.08)" }}>
          <Stack gap="xl">

            {/* 지역 선택 */}
            <Stack gap="sm">
              <Title order={4} fw={800} c="#0d2b6b">
                어느 지역에서 공사하시나요?
              </Title>
              <SimpleGrid cols={3} spacing="sm">
                {REGIONS.map((r) => {
                  const selected = region === r.id;
                  return (
                    <Box
                      key={r.id}
                      onClick={() => setRegion(r.id)}
                      style={{
                        padding: "18px 10px",
                        borderRadius: 12,
                        border: selected ? "2px solid #1565c0" : "1.5px solid #e8eef8",
                        background: selected ? "#e8f0fe" : "white",
                        cursor: "pointer",
                        transition: "all 0.15s ease",
                        textAlign: "center",
                      }}
                    >
                      <Box
                        style={{
                          display: "flex",
                          justifyContent: "center",
                          alignItems: "center",
                          marginBottom: 8,
                          color: selected ? "#1565c0" : "#aab4c8",
                          transition: "color 0.15s ease",
                        }}
                      >
                        {REGION_ICONS[r.id]}
                      </Box>
                      <Text fw={700} size="md" c={selected ? "#0d2b6b" : "gray.7"}>{r.label}</Text>
                      <Text size="xs" c="gray.4" mt={2}>{r.desc}</Text>
                    </Box>
                  );
                })}
              </SimpleGrid>
            </Stack>

            {/* 유형 선택 */}
            <Stack gap="sm">
              <Title order={4} fw={800} c="#0d2b6b">
                어떤 공간인가요?
              </Title>
              <SimpleGrid cols={2} spacing="sm">
                {TYPES.map((t) => {
                  const selected = type === t.id;
                  return (
                    <Box
                      key={t.id}
                      onClick={() => {
                        setType(t.id);
                        setCommercialType(null);
                      }}
                      style={{
                        padding: "20px 16px",
                        borderRadius: 14,
                        border: selected ? "2px solid #1565c0" : "1.5px solid #e8eef8",
                        background: selected ? "#e8f0fe" : "white",
                        cursor: "pointer",
                        transition: "all 0.15s ease",
                        textAlign: "center",
                      }}
                    >
                      <Text size="2rem" mb={6}>{t.icon}</Text>
                      <Text fw={700} c={selected ? "#0d2b6b" : "gray.7"} size="md">{t.label}</Text>
                      <Text size="xs" c="gray.5" mt={2}>{t.desc}</Text>
                    </Box>
                  );
                })}
              </SimpleGrid>
            </Stack>

            {/* 주거 등급 선택 */}
            {type === "residential" && (
              <Stack gap="sm">
                <Title order={4} fw={800} c="#0d2b6b">
                  어느 정도 수준으로 하실 건가요?
                </Title>
                <Stack gap="sm">
                  {RESIDENTIAL_GRADES.map((g) => {
                    const selected = residentialGrade === g.id;
                    return (
                      <Box
                        key={g.id}
                        onClick={() => setResidentialGrade(g.id)}
                        style={{
                          padding: "16px 20px",
                          borderRadius: 14,
                          border: selected ? `2px solid ${g.border}` : "1.5px solid #e8eef8",
                          background: selected ? g.bg : "white",
                          cursor: "pointer",
                          transition: "all 0.15s ease",
                          display: "flex",
                          alignItems: "center",
                          gap: 16,
                        }}
                      >
                        <Text size="1.8rem">{g.icon}</Text>
                        <Box style={{ flex: 1 }}>
                          <Group gap="xs" mb={2}>
                            <Text fw={700} size="md" c={selected ? g.color : "gray.8"}>
                              {g.label}
                            </Text>
                            {g.id === "standard" && (
                              <Box style={{ background: "#1565c0", borderRadius: 20, padding: "1px 8px" }}>
                                <Text size="xs" c="white" fw={600}>인기</Text>
                              </Box>
                            )}
                          </Group>
                          <Text size="sm" c="gray.6">{g.desc}</Text>
                          <Text size="xs" c="gray.4">{g.detail}</Text>
                        </Box>
                        {selected && (
                          <Box style={{ width: 22, height: 22, borderRadius: "50%", background: g.color, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                            <Text size="xs" c="white">✓</Text>
                          </Box>
                        )}
                      </Box>
                    );
                  })}
                </Stack>
              </Stack>
            )}

            {/* 상가 세부 유형 */}
            {type === "commercial" && (
              <Stack gap="sm">
                <Title order={4} fw={800} c="#0d2b6b">
                  어떤 업종인가요?
                </Title>
                <Stack gap="sm">
                  {[0, 1, 2].map((rowIndex) => {
                    const rowItems = COMMERCIAL_TYPES.slice(rowIndex * 3, rowIndex * 3 + 3);
                    const selectedInRow = rowItems.find((ct) => ct.id === commercialType);
                    return (
                      <Box key={rowIndex}>
                        <SimpleGrid cols={3} spacing="sm">
                          {rowItems.map((ct) => {
                            const selected = commercialType === ct.id;
                            return (
                              <Box
                                key={ct.id}
                                onClick={() => { setCommercialType(ct.id); setCommercialSub(null); }}
                                style={{
                                  padding: "16px 10px",
                                  borderRadius: 12,
                                  border: selected ? "2px solid #1565c0" : "1.5px solid #e8eef8",
                                  background: selected ? "#e8f0fe" : "white",
                                  cursor: "pointer",
                                  transition: "all 0.15s ease",
                                  textAlign: "center",
                                }}
                              >
                                <Text size="1.8rem" mb={4}>{ct.icon}</Text>
                                <Text size="sm" fw={selected ? 700 : 500} c={selected ? "#0d2b6b" : "gray.7"}>
                                  {ct.label}
                                </Text>
                              </Box>
                            );
                          })}
                        </SimpleGrid>

                        {/* 선택된 카드가 이 행에 있고 세부 업종이 있으면 바로 아래 표시 */}
                        {selectedInRow && selectedInRow.subs.length > 0 && (
                          <Box
                            style={{
                              marginTop: 8,
                              padding: "14px 16px",
                              borderRadius: 12,
                              background: "#f0f6ff",
                              border: "1.5px solid #d0e4ff",
                            }}
                          >
                            <Text size="xs" fw={700} c="#1565c0" mb={10} tt="uppercase" style={{ letterSpacing: "0.06em" }}>
                              세부 업종 선택
                            </Text>
                            <Group gap="sm">
                              {selectedInRow.subs.map((sub) => {
                                const selected = commercialSub === sub;
                                return (
                                  <Box
                                    key={sub}
                                    onClick={() => setCommercialSub(sub)}
                                    style={{
                                      padding: "8px 16px",
                                      borderRadius: 20,
                                      border: selected ? "2px solid #1565c0" : "1.5px solid #c5d8f5",
                                      background: selected ? "#1565c0" : "white",
                                      cursor: "pointer",
                                      transition: "all 0.15s ease",
                                    }}
                                  >
                                    <Text size="sm" fw={selected ? 700 : 500} c={selected ? "white" : "gray.7"}>
                                      {sub}
                                    </Text>
                                  </Box>
                                );
                              })}
                            </Group>
                          </Box>
                        )}
                      </Box>
                    );
                  })}
                </Stack>
              </Stack>
            )}

          </Stack>
        </Card>

        {/* 하단 버튼 */}
        <Group justify="space-between" mt="lg">
          <Button
            variant="subtle"
            color="gray"
            leftSection={<IconArrowLeft size={16} />}
            onClick={() => router.push("/")}
            radius="md"
          >
            홈으로
          </Button>

          <Button
            variant="gradient"
            gradient={{ from: "#1565c0", to: "#42a5f5" }}
            rightSection={<IconArrowRight size={16} />}
            radius="md"
            size="md"
            disabled={!canNext}
            onClick={() => router.push("/estimate/detail/step2")}
          >
            다음
          </Button>
        </Group>

      </Container>
    </Box>
  );
}
