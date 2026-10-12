import { Box, Container, VStack, HStack, Text, Heading, Flex, Link,
  Collapse, useDisclosure,
  useColorModeValue } from '@chakra-ui/react'
import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { selectedPublicationIds } from '@/site.config'
import { useLocalizedData } from '@/hooks/useLocalizedData'
import { comparePublicationDates } from '@/data'
import type { Publication } from '@/types'
import DynamicIcon from '../DynamicIcon'
import PublicationLinks from '../PublicationLinks'
import { PublicationFigure, PublicationFigurePreview } from '../PublicationFigure'

const PublicationCard = ({ pub }: { pub: Publication }) => {
  const { t } = useTranslation()
  const { siteOwner } = useLocalizedData()
  const { isOpen: isAbstractOpen, onToggle: onToggleAbstract } = useDisclosure()
  const { isOpen: isImageOpen, onOpen: onImageOpen, onClose: onImageClose } = useDisclosure()
  const borderColor = useColorModeValue('gray.200', 'gray.700')
  const authorHighlight = useColorModeValue('gray.700', 'gray.200')
  const summaryColor = useColorModeValue('gray.600', 'gray.300')
  const mutedColor = useColorModeValue('gray.500', 'gray.400')

  return (
    <Box data-publication-id={pub.id} p={[4, 5, 6]} bg={useColorModeValue('white', 'gray.800')} borderRadius="md" border="1px solid" borderColor={borderColor} transition="all 0.2s" _hover={{ borderColor: useColorModeValue('cyan.300', 'cyan.600') }}>
      <Flex direction={{ base: "column", lg: "row" }} gap={[4, 4, 6]} align="stretch">
        <PublicationFigure publication={pub} onOpen={onImageOpen} />
        <VStack align="start" spacing={2.5} flex={1} minW={0} justify="center">
          <HStack spacing={2} flexWrap="wrap" align="center">
            <Box h="2px" w="16px" bg="cyan.400" borderRadius="full" />
            <Text fontSize="xs" fontFamily="mono" color="cyan.400" fontWeight="semibold" letterSpacing={0} textTransform="uppercase">
              {pub.venue && String(pub.year) && pub.venue.includes(String(pub.year)) ? pub.venue : `${pub.venue} ${pub.year}`}
            </Text>
            {pub.venueType && <Text fontSize="2xs" color={useColorModeValue('gray.400', 'gray.500')} fontFamily="mono">/ {pub.venueType}</Text>}
            {pub.status === 'accepted' && <Text fontSize="xs" color="orange.400">{t('about.accepted')}</Text>}
          </HStack>
          <Heading size="sm" lineHeight="tall" fontWeight="semibold" color={useColorModeValue('gray.800', 'gray.100')}>{pub.title}</Heading>
          <VStack align="start" spacing={1.5} w="full">
            <Text fontSize="xs" color={useColorModeValue('gray.500', 'gray.400')} lineHeight="base">
              {pub.authors.map((author: string, idx: number) => {
                const isCoFirst = pub.isCoFirst && pub.coFirstAuthors?.includes(author)
                const isHighlighted = isCoFirst || siteOwner.name.authorVariants.includes(author)
                return (
                  <Text as="span" key={idx} fontWeight={isHighlighted ? 'semibold' : 'normal'} color={isHighlighted ? authorHighlight : undefined}>
                    {author}{isCoFirst && <Text as="sup" fontSize="2xs" color="cyan.400">*</Text>}{idx < pub.authors.length - 1 && ', '}
                  </Text>
                )
              })}
            </Text>
            {pub.specialBadges && pub.specialBadges.length > 0 && (
              <HStack spacing={1.5} flexWrap="wrap">
                {pub.specialBadges.map((badge: string) => (
                  <Text key={badge} fontSize="2xs" fontFamily="mono" px={2} py={0.5} borderRadius="sm" border="1px solid"
                    borderColor={badge === 'First Author' || badge === 'Co-First' ? useColorModeValue('cyan.200', 'cyan.700') : badge === 'Oral' || badge === 'Spotlight' || badge === 'Best Paper' ? useColorModeValue('orange.200', 'orange.700') : useColorModeValue('gray.200', 'gray.600')}
                    color={badge === 'First Author' || badge === 'Co-First' ? useColorModeValue('cyan.600', 'cyan.300') : badge === 'Oral' || badge === 'Spotlight' || badge === 'Best Paper' ? useColorModeValue('orange.600', 'orange.300') : useColorModeValue('gray.500', 'gray.400')}
                    bg={badge === 'First Author' || badge === 'Co-First' ? useColorModeValue('cyan.50', 'whiteAlpha.50') : badge === 'Oral' || badge === 'Spotlight' || badge === 'Best Paper' ? useColorModeValue('orange.50', 'whiteAlpha.50') : 'transparent'}
                  >{badge}</Text>
                ))}
                {pub.isCoFirst && <Text fontSize="2xs" color={useColorModeValue('gray.400', 'gray.500')} fontStyle="italic">{t('about.equalContribution')}</Text>}
              </HStack>
            )}
          </VStack>
          {pub.isCoFirst && !pub.specialBadges?.length && <Text fontSize="2xs" color={mutedColor}>{t('about.equalContribution')}</Text>}
          {(pub.summary || pub.abstract) && <Text data-publication-summary fontSize="sm" lineHeight="tall" color={summaryColor}>{pub.summary || pub.abstract}</Text>}
          <Box w="full" h="1px" bg={useColorModeValue('gray.100', 'gray.700')} />
          <Flex gap={1.5} flexWrap="wrap">
            <PublicationLinks links={pub.links} />
            {Object.keys(pub.links).length === 0 && <Text fontSize="xs" color={mutedColor}>{t('about.fullTextNotLinked')}</Text>}
            {pub.abstract && (
              <HStack as="button" spacing={1.5} px={2.5} py={1} borderRadius="sm" border="1px solid"
                borderColor={isAbstractOpen ? useColorModeValue('cyan.300', 'cyan.600') : borderColor}
                color={isAbstractOpen ? 'cyan.400' : useColorModeValue('gray.600', 'gray.400')}
                fontSize="xs" fontFamily="mono" transition="all 0.15s" _hover={{ borderColor: 'cyan.400', color: 'cyan.400' }}
                onClick={onToggleAbstract}
              >
                <DynamicIcon name="FaChevronRight" boxSize={2.5} style={{ transform: isAbstractOpen ? 'rotate(90deg)' : 'none', transition: 'transform 0.15s' }} />
                <Text>{t('about.abstract')}</Text>
              </HStack>
            )}
          </Flex>
        </VStack>
      </Flex>
      {pub.abstract && (
        <Collapse in={isAbstractOpen} animateOpacity>
          <Box mt={4} pt={4} borderTop="1px solid" borderColor={borderColor}>
            <Text fontSize={["xs", "sm"]} lineHeight="tall" color={useColorModeValue('gray.600', 'gray.400')}>{pub.abstract}</Text>
            {pub.keywords && (
              <HStack mt={3} spacing={1.5} flexWrap="wrap">
                {pub.keywords.map((keyword: string) => (
                  <Text key={keyword} fontSize="2xs" fontFamily="mono" color={useColorModeValue('gray.500', 'gray.500')} px={1.5} py={0.5} bg={useColorModeValue('gray.100', 'gray.800')} borderRadius="sm">{keyword}</Text>
                ))}
              </HStack>
            )}
          </Box>
        </Collapse>
      )}
      <PublicationFigurePreview isOpen={isImageOpen} onClose={onImageClose}
        src={pub.featuredImageFull || pub.featuredImage} alt={pub.featuredImageAlt || pub.title} />
    </Box>
  )
}

const SelectedPublicationsSection: React.FC = () => {
  const { t } = useTranslation()
  const { publications } = useLocalizedData()

  const selectedPubs = useMemo(
    () => publications.filter((pub) => selectedPublicationIds.has(pub.id)).sort(comparePublicationDates),
    [publications]
  )

  if (selectedPubs.length === 0) return null

  return (
    <Box w="full">
      <Container maxW={["full", "full", "7xl"]} px={[2, 4, 8]}>
        <Flex align="center" gap={3} mb={[3, 4]}>
          <Box h="2px" w="20px" bg="cyan.400" borderRadius="full" flexShrink={0} />
          <Heading size="md" fontWeight="semibold">{t('about.selectedPublications')}</Heading>
          <Box flex="1" h="1px" bg={useColorModeValue('gray.200', 'gray.700')} />
        </Flex>
        <VStack spacing={[4, 5, 6]} align="stretch">
          {selectedPubs.map((pub) => (
            <PublicationCard key={pub.id} pub={pub} />
          ))}
          <Box textAlign="center" pt={2}>
            <Link href="/publications" _hover={{ textDecoration: 'none' }}>
              <HStack spacing={2} justify="center" color={useColorModeValue('gray.500', 'gray.400')} fontSize="sm" fontFamily="mono" transition="all 0.15s" _hover={{ color: 'cyan.400' }}>
                <Text>{t('about.viewAllPublications')}</Text>
                <Text>→</Text>
              </HStack>
            </Link>
          </Box>
        </VStack>
      </Container>
    </Box>
  )
}

export default SelectedPublicationsSection
