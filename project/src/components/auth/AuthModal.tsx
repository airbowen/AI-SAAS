import React, { useState } from 'react'
import { X, Mail, Phone, Eye, EyeOff } from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'

interface AuthModalProps {
  isOpen: boolean
  onClose: () => void
  initialMode?: 'login' | 'register'
}

const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, initialMode = 'login' }) => {
  const [mode, setMode] = useState<'login' | 'register' | 'phone-login' | 'phone-otp'>(initialMode)
  const [loginType, setLoginType] = useState<'email' | 'phone'>('email')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  
  const [formData, setFormData] = useState({
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    otp: ''
  })

  const { signUp, signIn, signInWithPhone, sendPhoneOTP, verifyPhoneOTP } = useAuth()

  if (!isOpen) return null

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
    setError('')
  }

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const { error } = await signIn(formData.email, formData.password)
      if (error) {
        setError(error.message)
      } else {
        setSuccess('登录成功！')
        setTimeout(() => onClose(), 1000)
      }
    } catch (err) {
      setError('登录失败，请重试')
    } finally {
      setLoading(false)
    }
  }

  const handlePhoneLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const { error } = await signInWithPhone(formData.phone, formData.password)
      if (error) {
        setError(error.message)
      } else {
        setSuccess('登录成功！')
        setTimeout(() => onClose(), 1000)
      }
    } catch (err) {
      setError('登录失败，请重试')
    } finally {
      setLoading(false)
    }
  }

  const handlePhoneOTPLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const { error } = await sendPhoneOTP(formData.phone)
      if (error) {
        setError(error.message)
      } else {
        setMode('phone-otp')
        setSuccess('验证码已发送到您的手机')
      }
    } catch (err) {
      setError('发送验证码失败，请重试')
    } finally {
      setLoading(false)
    }
  }

  const handleOTPVerification = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const { error } = await verifyPhoneOTP(formData.phone, formData.otp)
      if (error) {
        setError(error.message)
      } else {
        setSuccess('登录成功！')
        setTimeout(() => onClose(), 1000)
      }
    } catch (err) {
      setError('验证失败，请重试')
    } finally {
      setLoading(false)
    }
  }

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    if (formData.password !== formData.confirmPassword) {
      setError('密码不匹配')
      setLoading(false)
      return
    }

    if (formData.password.length < 6) {
      setError('密码至少需要6位字符')
      setLoading(false)
      return
    }

    try {
      const { error } = await signUp(
        formData.email, 
        formData.password, 
        formData.phone || undefined
      )
      if (error) {
        setError(error.message)
      } else {
        setSuccess('注册成功！请检查您的邮箱进行验证')
        setTimeout(() => {
          setMode('login')
          setSuccess('')
        }, 2000)
      }
    } catch (err) {
      setError('注册失败，请重试')
    } finally {
      setLoading(false)
    }
  }

  const renderLoginForm = () => (
    <div className="space-y-6">
      <div className="flex space-x-2 bg-gray-100 rounded-lg p-1">
        <button
          type="button"
          onClick={() => setLoginType('email')}
          className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
            loginType === 'email'
              ? 'bg-white text-blue-600 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          <Mail className="h-4 w-4 inline mr-2" />
          邮箱登录
        </button>
        <button
          type="button"
          onClick={() => setLoginType('phone')}
          className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
            loginType === 'phone'
              ? 'bg-white text-blue-600 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          <Phone className="h-4 w-4 inline mr-2" />
          手机登录
        </button>
      </div>

      {loginType === 'email' ? (
        <form onSubmit={handleEmailLogin} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              邮箱地址
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="请输入邮箱地址"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              密码
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="请输入密码"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? '登录中...' : '登录'}
          </button>
        </form>
      ) : (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              手机号码
            </label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="请输入手机号码"
              required
            />
          </div>
          
          <div className="flex space-x-2">
            <button
              type="button"
              onClick={handlePhoneOTPLogin}
              disabled={loading || !formData.phone}
              className="flex-1 bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? '发送中...' : '发送验证码'}
            </button>
            <button
              type="button"
              onClick={() => setMode('phone-login')}
              className="flex-1 bg-gray-600 text-white py-2 px-4 rounded-lg hover:bg-gray-700 transition-colors"
            >
              密码登录
            </button>
          </div>
        </div>
      )}
    </div>
  )

  const renderPhonePasswordLogin = () => (
    <form onSubmit={handlePhoneLogin} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          手机号码
        </label>
        <input
          type="tel"
          name="phone"
          value={formData.phone}
          onChange={handleInputChange}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="请输入手机号码"
          required
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          密码
        </label>
        <div className="relative">
          <input
            type={showPassword ? 'text' : 'password'}
            name="password"
            value={formData.password}
            onChange={handleInputChange}
            className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="请输入密码"
            required
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600"
          >
            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
      </div>
      <div className="flex space-x-2">
        <button
          type="submit"
          disabled={loading}
          className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {loading ? '登录中...' : '登录'}
        </button>
        <button
          type="button"
          onClick={() => setMode('login')}
          className="flex-1 bg-gray-600 text-white py-2 px-4 rounded-lg hover:bg-gray-700 transition-colors"
        >
          返回
        </button>
      </div>
    </form>
  )

  const renderOTPForm = () => (
    <form onSubmit={handleOTPVerification} className="space-y-4">
      <div className="text-center">
        <p className="text-sm text-gray-600 mb-4">
          验证码已发送至 {formData.phone}
        </p>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          验证码
        </label>
        <input
          type="text"
          name="otp"
          value={formData.otp}
          onChange={handleInputChange}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-center text-lg tracking-widest"
          placeholder="请输入6位验证码"
          maxLength={6}
          required
        />
      </div>
      <div className="flex space-x-2">
        <button
          type="submit"
          disabled={loading || formData.otp.length !== 6}
          className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {loading ? '验证中...' : '验证登录'}
        </button>
        <button
          type="button"
          onClick={() => setMode('login')}
          className="flex-1 bg-gray-600 text-white py-2 px-4 rounded-lg hover:bg-gray-700 transition-colors"
        >
          返回
        </button>
      </div>
    </form>
  )

  const renderRegisterForm = () => (
    <form onSubmit={handleRegister} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          邮箱地址
        </label>
        <input
          type="email"
          name="email"
          value={formData.email}
          onChange={handleInputChange}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="请输入邮箱地址"
          required
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          手机号码（可选）
        </label>
        <input
          type="tel"
          name="phone"
          value={formData.phone}
          onChange={handleInputChange}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="请输入手机号码"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          密码
        </label>
        <div className="relative">
          <input
            type={showPassword ? 'text' : 'password'}
            name="password"
            value={formData.password}
            onChange={handleInputChange}
            className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="请输入密码（至少6位）"
            required
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600"
          >
            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          确认密码
        </label>
        <input
          type={showPassword ? 'text' : 'password'}
          name="confirmPassword"
          value={formData.confirmPassword}
          onChange={handleInputChange}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="请再次输入密码"
          required
        />
      </div>
      <button
        type="submit"
        disabled={loading}
        className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        {loading ? '注册中...' : '注册'}
      </button>
    </form>
  )

  const getTitle = () => {
    switch (mode) {
      case 'login':
        return '登录账户'
      case 'register':
        return '注册账户'
      case 'phone-login':
        return '手机密码登录'
      case 'phone-otp':
        return '验证码登录'
      default:
        return '登录账户'
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900">{getTitle()}</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          )}

          {success && (
            <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-green-600 text-sm">{success}</p>
            </div>
          )}

          {mode === 'login' && renderLoginForm()}
          {mode === 'phone-login' && renderPhonePasswordLogin()}
          {mode === 'phone-otp' && renderOTPForm()}
          {mode === 'register' && renderRegisterForm()}

          {(mode === 'login' || mode === 'phone-login') && (
            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600">
                还没有账户？{' '}
                <button
                  onClick={() => setMode('register')}
                  className="text-blue-600 hover:text-blue-700 font-medium"
                >
                  立即注册
                </button>
              </p>
            </div>
          )}

          {mode === 'register' && (
            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600">
                已有账户？{' '}
                <button
                  onClick={() => setMode('login')}
                  className="text-blue-600 hover:text-blue-700 font-medium"
                >
                  立即登录
                </button>
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default AuthModal