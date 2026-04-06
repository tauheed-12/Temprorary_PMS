import { createContext, useContext, useState, useEffect } from 'react'
import { getMe } from '../api/auth'

const AuthContext = createContext(null)

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = sessionStorage.getItem('access_token')
    if (token) {
      getMe()
        .then((res) => setUser(res.data))
        .catch(() => {
          sessionStorage.clear()
          setUser(null)
        })
        .finally(() => setLoading(false))
    } else {
      setLoading(false)
    }
  }, [])

  const login = (userData, accessToken, refreshToken) => {
    sessionStorage.setItem('access_token', accessToken)
    sessionStorage.setItem('refresh_token', refreshToken)
    setUser(userData)
  }

  const logout = () => {
    sessionStorage.clear()
    setUser(null)
  }

  const isOwner = () => user?.privilege_level >= 2
  const isClerk = () => user?.privilege_level >= 1

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, isOwner, isClerk }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)