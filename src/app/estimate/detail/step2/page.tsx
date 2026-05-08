"use client";

import {
  Box,
  Container,
  Card,
  Title,
  Text,
  Button,
  Stack,
  Group,
  NumberInput,
} from "@mantine/core";
import { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { IconArrowLeft, IconArrowRight } from "@tabler/icons-react";

const TOTAL_STEPS = 5;
const CURRENT_STEP = 2;

function FlightPath({ step, totalSteps }: { step: number; totalSteps: number }) {
  const progress = (step / totalSteps) * 100;
  const t = progress / 100;
  const x = (1 - t) * (1 - t) * 10 + 2 * (1 - t) * t * 155 + t * t * 300;
  const y = (1 - t) * (1 - t) * 65 + 2 * (1 - t) * t * 25 + t * t * 65;
  const dx = 2 * (1 - t) * (155 - 10) + 2 * t * (300 - 155);
  const dy = 2 * (1 - t) * (25 - 65) + 2 * t * (65 - 25);
  const angle = Math.atan2(dy, dx) * (180 / Math.PI);
  const isLanded = step >= totalSteps;

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
        <path d="M 10 65 Q 155 25 300 65" fill="none" stroke="#d0e4ff" strokeWidth="2" strokeDasharray="6 4" />
        <path
          d="M 10 65 Q 155 25 300 65"
          fill="none"
          stroke="#1565c0"
          strokeWidth="2.5"
          strokeDasharray={`${t * 330} 999`}
          strokeLinecap="round"
          style={{ transition: "stroke-dasharray 0.6s cubic-bezier(0.4,0,0.2,1)" }}
        />
        <circle cx="10" cy="65" r="5" fill="#1565c0" />
        <text x="10" y="85" textAnchor="middle" fontSize="8.5" fill="#1565c0" fontWeight="600">출발</text>

        {checkpoints.slice(0, totalSteps - 1).map((cp, i) => (
          <g key={i}>
            <circle cx={cp.x} cy={cp.y} r="4" fill={cp.done ? "#1565c0" : "white"} stroke={cp.done ? "#1565c0" : "#d0e4ff"} strokeWidth="1.5" style={{ transition: "all 0.4s ease" }} />
            <text x={cp.x} y={85} textAnchor="middle" fontSize="8" fill={cp.done ? "#1565c0" : "#bbb"} fontWeight={cp.done ? "700" : "400"}>
              {i + 1}단계
            </text>
          </g>
        ))}

        <circle cx="300" cy="65" r="5" fill={isLanded ? "#1565c0" : "white"} stroke={isLanded ? "#1565c0" : "#d0e4ff"} strokeWidth="1.5" style={{ transition: "all 0.4s ease" }} />
        <text x="300" y="85" textAnchor="middle" fontSize="8.5" fill={isLanded ? "#1565c0" : "#bbb"} fontWeight="600">견적완성</text>

        <g transform={`translate(${x}, ${y}) rotate(${angle})`} style={{ transition: "transform 0.6s cubic-bezier(0.4,0,0.2,1)" }}>
          <ellipse cx="0" cy="0" rx="13" ry="3.2" fill="#1565c0" />
          <ellipse cx="13" cy="0" rx="4" ry="2" fill="#1a78d4" />
          <ellipse cx="-13" cy="0" rx="3" ry="1.8" fill="#0d47a1" />
          <path d="M 2,0 L -4,-13 L -8,-12 L -3,0 Z" fill="#1976d2" />
          <path d="M 2,0 L -4,13 L -8,12 L -3,0 Z" fill="#1976d2" />
          <path d="M -10,0 L -14,-6 L -15,-5.5 L -11,0 Z" fill="#1565c0" />
          <path d="M -10,0 L -14,6 L -15,5.5 L -11,0 Z" fill="#1565c0" />
          <path d="M -10,0 L -15,-5 L -14,0 Z" fill="#0d47a1" />
          <ellipse cx="-1" cy="-8" rx="4" ry="1.8" fill="#0d47a1" />
          <ellipse cx="1" cy="-8" rx="2" ry="1.8" fill="#1a78d4" />
          <ellipse cx="-1" cy="8" rx="4" ry="1.8" fill="#0d47a1" />
          <ellipse cx="1" cy="8" rx="2" ry="1.8" fill="#1a78d4" />
          <circle cx="6" cy="-1" r="1" fill="rgba(255,255,255,0.7)" />
          <circle cx="3" cy="-1" r="1" fill="rgba(255,255,255,0.7)" />
          <circle cx="0" cy="-1" r="1" fill="rgba(255,255,255,0.7)" />
        </g>

        <text x={x} y={y - 16} textAnchor="middle" fontSize="10" fill="#1565c0" fontWeight="700" style={{ transition: "all 0.6s ease" }}>
          {Math.round(progress)}%
        </text>
      </svg>

      <Text ta="center" size="xs" c="gray.5" mt={-4}>
        {step} / {totalSteps} 단계 완료
      </Text>
    </Box>
  );
}

export default function Step2Page() {
  const router = useRouter();
  const [area, setArea] = useState<number | string>("");

  const canNext = Number(area) >= 1;

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
            <Text size="sm" c="rgba(255,255,255,0.7)">AI 세부 견적 · 2단계</Text>
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

            {/* 평수 입력 */}
            <Stack gap="sm">
              <Title order={4} fw={800} c="#0d2b6b">
                공사 면적이 얼마나 되나요?
              </Title>
              <Text size="sm" c="gray.5">
                공급면적 기준으로 입력해주세요
              </Text>

              <Box style={{ position: "relative" }}>
                <NumberInput
                  placeholder="예) 32"
                  radius="md"
                  size="xl"
                  min={1}
                  max={9999}
                  value={area}
                  onChange={setArea}
                  rightSection={
                    <Text size="md" fw={700} c="gray.5" pr={12}>
                      평
                    </Text>
                  }
                  rightSectionWidth={48}
                  styles={{
                    input: {
                      fontSize: "1.5rem",
                      fontWeight: 700,
                      color: "#0d2b6b",
                      textAlign: "center",
                      paddingRight: 56,
                      height: 72,
                      border: "2px solid #e8eef8",
                      borderRadius: 14,
                    },
                  }}
                />
              </Box>

              {/* 평수 가이드 */}
              <Box
                style={{
                  marginTop: 4,
                  padding: "14px 16px",
                  borderRadius: 12,
                  background: "#f8faff",
                  border: "1.5px solid #e3eeff",
                }}
              >
                <Text size="xs" fw={700} c="#1565c0" mb={8}>
                  평수 참고 가이드
                </Text>
                <Stack gap={4}>
                  {[
                    { range: "10평 이하", desc: "소형 매장, 1인샵" },
                    { range: "10 ~ 30평", desc: "일반 매장, 소형 오피스" },
                    { range: "30 ~ 60평", desc: "중형 매장, 카페, 학원" },
                    { range: "60 ~ 100평", desc: "대형 매장, 헬스장" },
                    { range: "100평 이상", desc: "대형 공간, 복합시설" },
                  ].map((g) => (
                    <Group key={g.range} gap="xs">
                      <Text size="xs" fw={600} c="gray.6" w={90}>{g.range}</Text>
                      <Text size="xs" c="gray.4">·</Text>
                      <Text size="xs" c="gray.5">{g.desc}</Text>
                    </Group>
                  ))}
                </Stack>
              </Box>
            </Stack>

          </Stack>
        </Card>

        {/* 하단 버튼 */}
        <Group justify="space-between" mt="lg">
          <Button
            variant="subtle"
            color="gray"
            leftSection={<IconArrowLeft size={16} />}
            onClick={() => router.back()}
            radius="md"
          >
            이전
          </Button>

          <Button
            variant="gradient"
            gradient={{ from: "#1565c0", to: "#42a5f5" }}
            rightSection={<IconArrowRight size={16} />}
            radius="md"
            size="md"
            disabled={!canNext}
            onClick={() => router.push("/estimate/detail/step3")}
          >
            다음
          </Button>
        </Group>

      </Container>
    </Box>
  );
}
