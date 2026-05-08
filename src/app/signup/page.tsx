"use client";

import {
  Box,
  Container,
  Card,
  Title,
  Text,
  TextInput,
  PasswordInput,
  Button,
  Stack,
  Group,
  Divider,
  Anchor,
  Checkbox,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import Image from "next/image";
import { useRouter } from "next/navigation";

export default function SignupPage() {
  const router = useRouter();

  const form = useForm({
    initialValues: {
      name: "",
      phone: "",
      email: "",
      password: "",
      passwordConfirm: "",
      agree: false,
    },
    validate: {
      name: (v) => (v.trim().length >= 2 ? null : "이름을 입력해주세요"),
      phone: (v) => (/^01[0-9]{8,9}$/.test(v.replace(/-/g, "")) ? null : "올바른 연락처를 입력해주세요"),
      email: (v) => (/^\S+@\S+$/.test(v) ? null : "이메일 형식을 확인해주세요"),
      password: (v) => (v.length >= 6 ? null : "비밀번호는 6자 이상이어야 합니다"),
      passwordConfirm: (v, values) => (v === values.password ? null : "비밀번호가 일치하지 않습니다"),
      agree: (v) => (v ? null : "이용약관에 동의해주세요"),
    },
  });

  const handleSignup = form.onSubmit((values) => {
    console.log("회원가입 시도:", values);
    // TODO: Supabase 연동
    router.push("/");
  });

  return (
    <Box
      style={{
        minHeight: "100vh",
        background: "linear-gradient(180deg, #0a2a6e 0%, #1565c0 40%, #42a5f5 80%, #e3f2fd 100%)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "20px",
      }}
    >
      <Container size={440} w="100%">
        {/* 로고 */}
        <Group justify="center" mb={32} style={{ cursor: "pointer" }} onClick={() => router.push("/")}>
          <Image src="/logo.png" alt="인테리어허브" width={40} height={40} style={{ borderRadius: 8 }} />
          <Text fw={800} size="xl" c="white" style={{ letterSpacing: "-0.02em" }}>
            인테리어허브
          </Text>
        </Group>

        <Card
          padding="xl"
          radius="xl"
          style={{
            background: "rgba(255,255,255,0.97)",
            boxShadow: "0 20px 60px rgba(0,0,0,0.2)",
          }}
        >
          <Stack gap="xs" mb={24}>
            <Title order={2} fw={800} c="#0d2b6b">
              무료 회원가입
            </Title>
            <Text c="gray.6" size="sm">
              이미 계정이 있으신가요?{" "}
              <Anchor href="/login" c="blue" fw={600} size="sm">
                로그인
              </Anchor>
            </Text>
          </Stack>

          <form onSubmit={handleSignup}>
            <Stack gap="md">
              <TextInput
                label="이름"
                placeholder="홍길동"
                radius="md"
                size="md"
                {...form.getInputProps("name")}
              />
              <TextInput
                label="연락처"
                placeholder="010-0000-0000"
                radius="md"
                size="md"
                {...form.getInputProps("phone")}
              />
              <TextInput
                label="이메일"
                placeholder="example@email.com"
                radius="md"
                size="md"
                {...form.getInputProps("email")}
              />
              <PasswordInput
                label="비밀번호"
                placeholder="6자 이상 입력"
                radius="md"
                size="md"
                {...form.getInputProps("password")}
              />
              <PasswordInput
                label="비밀번호 확인"
                placeholder="비밀번호를 다시 입력하세요"
                radius="md"
                size="md"
                {...form.getInputProps("passwordConfirm")}
              />

              <Checkbox
                label={
                  <Text size="sm" c="gray.7">
                    <Anchor href="#" size="sm" c="blue">이용약관</Anchor> 및{" "}
                    <Anchor href="#" size="sm" c="blue">개인정보처리방침</Anchor>에 동의합니다
                  </Text>
                }
                {...form.getInputProps("agree", { type: "checkbox" })}
              />

              <Button
                type="submit"
                variant="gradient"
                gradient={{ from: "#1565c0", to: "#42a5f5" }}
                radius="md"
                size="md"
                fullWidth
                mt="xs"
              >
                회원가입
              </Button>

              <Divider label="또는" labelPosition="center" c="gray.4" />

              <Button
                variant="default"
                radius="md"
                size="md"
                fullWidth
                leftSection={
                  <svg width="18" height="18" viewBox="0 0 18 18">
                    <path fill="#4285F4" d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.874 2.684-6.615z"/>
                    <path fill="#34A853" d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.258c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332C2.438 15.983 5.482 18 9 18z"/>
                    <path fill="#FBBC05" d="M3.964 10.707c-.18-.54-.282-1.117-.282-1.707s.102-1.167.282-1.707V4.961H.957C.347 6.175 0 7.55 0 9s.348 2.825.957 4.039l3.007-2.332z"/>
                    <path fill="#EA4335" d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0 5.482 0 2.438 2.017.957 4.961L3.964 7.293C4.672 5.166 6.656 3.58 9 3.58z"/>
                  </svg>
                }
              >
                Google로 가입
              </Button>
            </Stack>
          </form>
        </Card>
      </Container>
    </Box>
  );
}
