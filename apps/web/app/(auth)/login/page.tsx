'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Form, Input, Button, Card, Typography, Space, App, Select } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import { useAuth } from '@/hooks/useAuth';
import { useI18n } from '@/i18n/provider';
import { SUPPORTED_LOCALES, type SupportedLocale } from '@/i18n/locale';
import { getErrorMessage } from '@/utils/error';

const { Title, Text } = Typography;

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const { message } = App.useApp();
  const { t, locale, setLocale } = useI18n();
  const [loading, setLoading] = useState(false);

  const localeOptions = SUPPORTED_LOCALES.map((value) => ({
    value,
    label: t(`locale.${value}`),
  }));

  // 表单提交
  const handleSubmit = async (values: { email: string; password: string; locale: SupportedLocale }) => {
    setLoading(true);
    try {
      setLocale(values.locale);
      await login(values);
      message.success(t('login.messages.success'));
      router.push('/dashboard');
    } catch (error: unknown) {
      const errorMessage = getErrorMessage(error, t('login.messages.failed'));
      message.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      }}
    >
      <Card
        style={{
          width: 400,
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
          borderRadius: 12,
        }}
        variant="borderless"
      >
        <Space direction="vertical" size={24} style={{ width: '100%' }}>
          <div style={{ textAlign: 'center' }}>
            <Title level={2} style={{ marginBottom: 8 }}>
              {t('login.title')}
            </Title>
            <Text type="secondary">{t('login.subtitle')}</Text>
          </div>

          <Form
            name="login"
            layout="vertical"
            onFinish={handleSubmit}
            autoComplete="off"
            size="large"
            initialValues={{
              email: 'admin@acme.test',
              password: 'Admin#123',
              locale,
            }}
          >
            <Form.Item name="locale" label={t('login.fields.locale')}>
              <Select
                options={localeOptions}
                onChange={(value) => setLocale(value)}
              />
            </Form.Item>

            <Form.Item
              name="email"
              rules={[
                { required: true, message: t('login.validation.email_required') },
                { type: 'email', message: t('login.validation.email_invalid') },
              ]}
            >
              <Input prefix={<UserOutlined />} placeholder={t('login.placeholders.email')} autoComplete="email" />
            </Form.Item>

            <Form.Item
              name="password"
              rules={[{ required: true, message: t('login.validation.password_required') }]}
            >
              <Input.Password prefix={<LockOutlined />} placeholder={t('login.placeholders.password')} autoComplete="current-password" />
            </Form.Item>

            <Form.Item style={{ marginBottom: 0 }}>
              <Button type="primary" htmlType="submit" loading={loading} block style={{ height: 44 }}>
                {t('login.actions.submit')}
              </Button>
            </Form.Item>
          </Form>

          <div style={{ textAlign: 'center' }}>
            <Text type="secondary" style={{ fontSize: 12 }}>
              {t('login.demo_hint')}
            </Text>
          </div>
        </Space>
      </Card>
    </div>
  );
}
