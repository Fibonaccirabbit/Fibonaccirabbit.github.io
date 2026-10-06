import { Box, useColorMode } from '@chakra-ui/react'
import { useSlot } from '@/templates/context'
import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { useTranslation } from 'react-i18next'

interface LayoutProps {
  children: React.ReactNode
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { colorMode } = useColorMode()
  const Navbar = useSlot('navbar')
  const { pathname } = useLocation()
  const { i18n } = useTranslation()
  useEffect(() => { document.documentElement.dataset.theme = colorMode }, [colorMode])
  useEffect(() => { window.scrollTo(0, 0) }, [pathname])
  useEffect(() => { document.documentElement.lang = i18n.language }, [i18n.language])

  return (
    <Box minH="100vh" w="full" className={colorMode === 'dark' ? 'dark-theme' : ''}>
      <Navbar />
      <Box w="full" px={4}>
        {children}
      </Box>
    </Box>
  )
}

export default Layout
