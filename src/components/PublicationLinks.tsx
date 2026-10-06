import { Flex, HStack, Link, Text, Tooltip, useColorModeValue } from '@chakra-ui/react'
import { useTranslation } from 'react-i18next'
import type { Publication } from '@/types'
import DynamicIcon from './DynamicIcon'

const resources = [
  { key: 'paper', icon: 'FaFileAlt', label: 'paper' },
  { key: 'arxiv', icon: 'SiArxiv', label: 'arXiv' },
  { key: 'code', icon: 'FaGithub', label: 'code' },
  { key: 'scholar', icon: 'SiGooglescholar', label: 'scholar' },
  { key: 'projectPage', icon: 'FaGlobe', label: 'project' },
  { key: 'dataset', icon: 'FaDatabase', label: 'dataset' },
  { key: 'demo', icon: 'FaPlay', label: 'demo' },
] as const

const PublicationLinks = ({ links, compact = false }: { links: Publication['links']; compact?: boolean }) => {
  const { t } = useTranslation()
  const color = useColorModeValue('gray.600', 'gray.400')
  const border = useColorModeValue('gray.200', 'gray.600')

  return (
    <Flex gap={1.5} wrap="wrap">
      {resources.map(resource => {
        const href = links[resource.key]
        if (!href) return null
        const label = t(`about.${resource.label}`)
        return (
          <Tooltip key={resource.key} label={label}>
            <Link href={href} isExternal aria-label={label} title={label} color={color}
              onClick={event => event.stopPropagation()} display="inline-flex" alignItems="center"
              justifyContent="center" minH="32px" w={compact ? '32px' : undefined} px={compact ? 0 : 2.5}
              border="1px solid" borderColor={border} borderRadius="sm" fontSize="xs" fontFamily="mono"
              _hover={{ color: 'cyan.400', borderColor: 'cyan.400', textDecoration: 'none' }}
            >
              <HStack spacing={1.5}>
                <DynamicIcon name={resource.icon} boxSize={3.5} />
                {!compact && <Text>{label}</Text>}
              </HStack>
            </Link>
          </Tooltip>
        )
      })}
    </Flex>
  )
}

export default PublicationLinks
