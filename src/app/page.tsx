"use client";

import {
  Box,
  Container,
  Title,
  Text,
  SimpleGrid,
  Card,
  Badge,
  Button,
  Group,
  Stack,
  ThemeIcon,
  List,
} from "@mantine/core";
import {
  IconBolt,
  IconChartBar,
  IconArrowRight,
  IconCheck,
} from "@tabler/icons-react";
import Image from "next/image";
import { useRouter } from "next/navigation";

const SIMPLE_FEATURES = [
  "평수 · 지역 · 자재등급만 입력",
  "30초 내 견적 확인",
  "전체 공사 기준 예상 금액",
];

const DETAIL_FEATURES = [
  "공종별 개별 선택 (도배, 바닥, 욕실 등)",
  "자재 등급 공종별 설정",
  "항목별 상세 금액 내역",
  "PDF 정교한 견적서 발급",
];

function PlaneSVG({ size = 48, opacity = 1 }: { size?: number; opacity?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      fill="none"
      style={{ opacity }}
    >
      <path
        d="M58 28L40 22L32 4L24 22L6 28L16 34L12 52L32 42L52 52L48 34L58 28Z"
        fill="white"
        fillOpacity="0.9"
      />
      <path
        d="M32 4L40 22L58 28L48 34L52 52L32 42L12 52L16 34L6 28L24 22L32 4Z"
        stroke="rgba(255,255,255,0.4)"
        strokeWidth="1"
      />
    </svg>
  );
}

// 실제 비행기 SVG
function AirplaneSVG({ size = 60, color = "white", opacity = 0.9 }: { size?: number; color?: string; opacity?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" fill="none" style={{ opacity }}>
      <path
        d="M90 45 L55 40 L45 10 L38 10 L44 40 L20 38 L16 28 L10 28 L12 45 L10 62 L16 62 L20 52 L44 50 L38 80 L45 80 L55 50 L90 45Z"
        fill={color}
      />
    </svg>
  );
}

export default function Home() {
  const router = useRouter();

  return (
    <Box style={{ minHeight: "100vh", background: "#f0f6ff" }}>
      <style>{`
        @keyframes fly1 {
          0%   { transform: translateX(-120px) translateY(0px) rotate(5deg); opacity: 0; }
          5%   { opacity: 1; }
          95%  { opacity: 1; }
          100% { transform: translateX(110vw) translateY(-60px) rotate(5deg); opacity: 0; }
        }
        @keyframes fly2 {
          0%   { transform: translateX(-120px) translateY(0px) rotate(3deg); opacity: 0; }
          5%   { opacity: 0.6; }
          95%  { opacity: 0.6; }
          100% { transform: translateX(110vw) translateY(30px) rotate(3deg); opacity: 0; }
        }
        @keyframes fly3 {
          0%   { transform: translateX(-80px) translateY(0px) rotate(6deg); opacity: 0; }
          5%   { opacity: 0.35; }
          95%  { opacity: 0.35; }
          100% { transform: translateX(110vw) translateY(-20px) rotate(6deg); opacity: 0; }
        }
        @keyframes trailFade {
          0%   { width: 0; opacity: 0.6; }
          100% { width: 80px; opacity: 0; }
        }
        @keyframes cloudDrift {
          0%   { transform: translateX(0); }
          100% { transform: translateX(30px); }
        }
      `}</style>

      {/* 하늘 히어로 */}
      <Box
        style={{
          background: "linear-gradient(180deg, #0a2a6e 0%, #1565c0 28%, #42a5f5 62%, #90caf9 82%, #e3f2fd 100%)",
          paddingBottom: 100,
          position: "relative",
          overflow: "hidden",
          minHeight: 520,
        }}
      >
        {/* 구름 1 */}
        <Box style={{ position: "absolute", top: "42%", left: "8%", animation: "cloudDrift 6s ease-in-out infinite alternate" }}>
          <svg width="120" height="40" viewBox="0 0 120 40" fill="none">
            <ellipse cx="60" cy="28" rx="55" ry="14" fill="rgba(255,255,255,0.18)" />
            <ellipse cx="45" cy="22" rx="30" ry="16" fill="rgba(255,255,255,0.18)" />
            <ellipse cx="75" cy="20" rx="25" ry="14" fill="rgba(255,255,255,0.15)" />
          </svg>
        </Box>

        {/* 구름 2 */}
        <Box style={{ position: "absolute", top: "30%", right: "10%", animation: "cloudDrift 8s ease-in-out infinite alternate-reverse" }}>
          <svg width="90" height="32" viewBox="0 0 90 32" fill="none">
            <ellipse cx="45" cy="22" rx="40" ry="11" fill="rgba(255,255,255,0.14)" />
            <ellipse cx="32" cy="17" rx="22" ry="13" fill="rgba(255,255,255,0.14)" />
            <ellipse cx="60" cy="16" rx="18" ry="11" fill="rgba(255,255,255,0.12)" />
          </svg>
        </Box>

        {/* 구름 3 */}
        <Box style={{ position: "absolute", top: "55%", left: "55%", animation: "cloudDrift 7s ease-in-out infinite alternate" }}>
          <svg width="70" height="26" viewBox="0 0 70 26" fill="none">
            <ellipse cx="35" cy="18" rx="30" ry="9" fill="rgba(255,255,255,0.12)" />
            <ellipse cx="25" cy="14" rx="18" ry="10" fill="rgba(255,255,255,0.12)" />
            <ellipse cx="48" cy="13" rx="15" ry="9" fill="rgba(255,255,255,0.10)" />
          </svg>
        </Box>

        {/* 별 */}
        {[
          { top: "7%", left: "10%", size: 2 },
          { top: "13%", left: "32%", size: 1.5 },
          { top: "5%", left: "60%", size: 2 },
          { top: "18%", left: "78%", size: 1.5 },
          { top: "9%", left: "90%", size: 2 },
        ].map((s, i) => (
          <Box key={i} style={{ position: "absolute", top: s.top, left: s.left, width: s.size, height: s.size, borderRadius: "50%", background: "rgba(255,255,255,0.8)" }} />
        ))}

        {/* 비행기 1 — 크고 선명, 중단 */}
        <Box
          style={{
            position: "absolute",
            top: "32%",
            left: 0,
            animation: "fly1 18s linear infinite",
            animationDelay: "0s",
            zIndex: 5,
          }}
        >
          <AirplaneSVG size={64} color="white" opacity={0.95} />
        </Box>

        {/* 비행기 2 — 중간, 상단 */}
        <Box
          style={{
            position: "absolute",
            top: "14%",
            left: 0,
            animation: "fly2 24s linear infinite",
            animationDelay: "6s",
            zIndex: 5,
          }}
        >
          <AirplaneSVG size={44} color="white" opacity={0.6} />
        </Box>

        {/* 비행기 3 — 작고 희미, 하단 */}
        <Box
          style={{
            position: "absolute",
            top: "52%",
            left: 0,
            animation: "fly3 30s linear infinite",
            animationDelay: "12s",
            zIndex: 5,
          }}
        >
          <AirplaneSVG size={32} color="white" opacity={0.35} />
        </Box>

        {/* 하단 페이드 */}
        <Box
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            height: 130,
            background: "linear-gradient(180deg, transparent 0%, #f0f6ff 100%)",
            zIndex: 6,
          }}
        />

        {/* 헤더 */}
        <Container size="lg" py="md" style={{ position: "relative", zIndex: 10 }}>
          <Group justify="space-between">
            <Group gap={8} align="center">
              <Image src="/logo.png" alt="인테리어허브 로고" width={36} height={36} style={{ borderRadius: 8 }} />
              <Text fw={800} size="xl" c="white" style={{ letterSpacing: "-0.02em" }}>
                인테리어허브
              </Text>
            </Group>
            <Button
              variant="outline"
              size="sm"
              radius="xl"
              style={{ borderColor: "rgba(255,255,255,0.5)", color: "white" }}
            >
              로그인
            </Button>
          </Group>
        </Container>

        {/* 히어로 텍스트 */}
        <Container size="lg" pt={60} pb={40} style={{ position: "relative", zIndex: 10 }}>
          <Stack align="center" gap="lg">
            <Badge
              size="lg"
              radius="xl"
              style={{
                background: "rgba(255,255,255,0.18)",
                backdropFilter: "blur(10px)",
                color: "white",
                border: "1px solid rgba(255,255,255,0.35)",
                letterSpacing: "0.06em",
                fontWeight: 600,
              }}
            >
              ✈︎ &nbsp; AI 기반 자동 견적 서비스
            </Badge>

            <Title
              order={1}
              ta="center"
              c="white"
              style={{
                fontSize: "clamp(1.8rem, 4.5vw, 3.4rem)",
                fontWeight: 800,
                lineHeight: 1.25,
                letterSpacing: "-0.02em",
                textShadow: "0 2px 24px rgba(0,0,0,0.18)",
              }}
            >
              현직 인테리어 전문가 +{" "}
              <Text
                component="span"
                style={{
                  fontSize: "inherit",
                  fontWeight: "inherit",
                  background: "linear-gradient(90deg, #ffd54f, #ffb300)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                }}
              >
                100여개 이상 업체의 데이터
              </Text>
              로 만든
              <br />
              국내 최초 AI 자동 견적
            </Title>

            <Text
              ta="center"
              c="rgba(255,255,255,0.85)"
              size="lg"
              maw={500}
              style={{ lineHeight: 1.7 }}
            >
              복잡하고 불투명했던 인테리어 견적.<br />
              조건만 입력하면 전문가 수준의 견적서를 무료로 받아보세요.
            </Text>
          </Stack>
        </Container>
      </Box>

      {/* 카드 섹션 */}
      <Container size="md" style={{ marginTop: -48, position: "relative", zIndex: 20 }} pb={80}>
        <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="xl">

          {/* 간단 견적 */}
          <Card
            padding="xl"
            style={{
              background: "white",
              border: "1.5px solid #e3eeff",
              boxShadow: "0 8px 40px rgba(21,101,192,0.10)",
              cursor: "pointer",
              transition: "all 0.25s ease",
            }}
            onClick={() => router.push("/estimate/simple")}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "translateY(-6px)";
              e.currentTarget.style.boxShadow = "0 20px 60px rgba(21,101,192,0.18)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "translateY(0)";
              e.currentTarget.style.boxShadow = "0 8px 40px rgba(21,101,192,0.10)";
            }}
          >
            <Stack gap="lg">
              <ThemeIcon size={56} radius="xl" variant="gradient" gradient={{ from: "#1565c0", to: "#42a5f5" }}>
                <IconBolt size={28} />
              </ThemeIcon>

              <Stack gap={6}>
                <Group gap="xs" align="center">
                  <Title order={3} c="#0d2b6b" fw={800}>AI 간단 견적</Title>
                  <Badge color="blue" variant="light" size="sm" radius="xl">30초</Badge>
                </Group>
                <Text c="gray.6" size="sm">빠르게 전체 공사 예상 금액 확인</Text>
              </Stack>

              <List spacing={10} icon={
                <ThemeIcon color="blue" size={20} radius="xl" variant="light">
                  <IconCheck size={12} />
                </ThemeIcon>
              }>
                {SIMPLE_FEATURES.map((f) => (
                  <List.Item key={f}><Text c="gray.7" size="sm">{f}</Text></List.Item>
                ))}
              </List>

              <Button
                variant="gradient"
                gradient={{ from: "#1565c0", to: "#42a5f5" }}
                rightSection={<IconArrowRight size={16} />}
                radius="xl"
                size="md"
              >
                간단 견적 시작하기
              </Button>
            </Stack>
          </Card>

          {/* 세부 견적 */}
          <Card
            padding="xl"
            style={{
              background: "white",
              border: "1.5px solid #ede8ff",
              boxShadow: "0 8px 40px rgba(99,60,180,0.10)",
              cursor: "pointer",
              transition: "all 0.25s ease",
            }}
            onClick={() => router.push("/estimate/detail")}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "translateY(-6px)";
              e.currentTarget.style.boxShadow = "0 20px 60px rgba(99,60,180,0.18)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "translateY(0)";
              e.currentTarget.style.boxShadow = "0 8px 40px rgba(99,60,180,0.10)";
            }}
          >
            <Stack gap="lg">
              <ThemeIcon size={56} radius="xl" variant="gradient" gradient={{ from: "#5c35b5", to: "#9575cd" }}>
                <IconChartBar size={28} />
              </ThemeIcon>

              <Stack gap={6}>
                <Group gap="xs" align="center">
                  <Title order={3} c="#2d1b69" fw={800}>AI 세부 견적</Title>
                  <Badge color="violet" variant="light" size="sm" radius="xl">정교함</Badge>
                </Group>
                <Text c="gray.6" size="sm">공종별 상세 견적 + PDF 견적서 발급</Text>
              </Stack>

              <List spacing={10} icon={
                <ThemeIcon color="violet" size={20} radius="xl" variant="light">
                  <IconCheck size={12} />
                </ThemeIcon>
              }>
                {DETAIL_FEATURES.map((f) => (
                  <List.Item key={f}><Text c="gray.7" size="sm">{f}</Text></List.Item>
                ))}
              </List>

              <Button
                variant="gradient"
                gradient={{ from: "#5c35b5", to: "#9575cd" }}
                rightSection={<IconArrowRight size={16} />}
                radius="xl"
                size="md"
              >
                세부 견적 시작하기
              </Button>
            </Stack>
          </Card>
        </SimpleGrid>

        <Text ta="center" c="gray.5" size="sm" mt={40}>
          PDF 견적서 발급은 무료 회원가입 후 이용 가능합니다
        </Text>
      </Container>
    </Box>
  );
}
