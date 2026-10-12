import {
  Box, HStack, Icon, IconButton, Image, Modal, ModalBody, ModalCloseButton,
  ModalContent, ModalOverlay, Text, Tooltip, useColorModeValue,
} from '@chakra-ui/react'
import { FaExternalLinkAlt, FaSearchPlus } from 'react-icons/fa'
import { useTranslation } from 'react-i18next'
import type { MouseEvent } from 'react'
import type { Publication } from '@/types'

export const PublicationFigure = ({ publication, onOpen }: {
  publication: Publication
  onOpen: () => void
}) => {
  const { t } = useTranslation()
  const captionColor = useColorModeValue('gray.600', 'gray.400')
  if (!publication.featuredImage) return null

  return (
    <Box as="figure" m={0} w={{ base: 'full', lg: '300px' }} flexShrink={0} minW={0}>
      <Tooltip label={t('about.viewFigure')}>
        <Box as="button" type="button" aria-label={`${t('about.viewFigure')}: ${publication.title}`}
          onClick={(event: MouseEvent<HTMLButtonElement>) => { event.stopPropagation(); onOpen() }}
          position="relative" display="block" w="full" aspectRatio={2.2}
          bg="white" borderRadius="sm" overflow="hidden" cursor="zoom-in"
          border="1px solid" borderColor="gray.200"
          _hover={{ borderColor: 'cyan.400' }} _focusVisible={{ outline: '2px solid', outlineColor: 'cyan.400', outlineOffset: '3px' }}
        >
          <Image data-publication-figure src={publication.featuredImage}
            alt={publication.featuredImageAlt || publication.title}
            w="full" h="full" objectFit="contain" p={2} loading="lazy" />
          <Icon as={FaSearchPlus} position="absolute" bottom={2} right={2} color="gray.600" boxSize={3.5} aria-hidden />
        </Box>
      </Tooltip>
      {publication.featuredImageCaption && (
        <Text as="figcaption" fontSize="xs" lineHeight="tall" mt={2} color={captionColor}>
          {publication.featuredImageCaption}
        </Text>
      )}
    </Box>
  )
}

export const PublicationFigurePreview = ({ isOpen, onClose, src, alt }: {
  isOpen: boolean
  onClose: () => void
  src?: string
  alt: string
}) => {
  const { t } = useTranslation()
  return (
    <Modal isOpen={isOpen} onClose={onClose} size="6xl" isCentered>
      <ModalOverlay />
      <ModalContent maxW="94vw" borderRadius="md">
        <HStack h="48px" px={3} justify="space-between">
          <Text fontSize="sm" noOfLines={1} flex={1} minW={0}>{t('about.figure')}</Text>
          {src && <Tooltip label={t('about.openOriginalFigure')}>
            <IconButton as="a" href={src} target="_blank" rel="noopener noreferrer"
              aria-label={t('about.openOriginalFigure')} icon={<FaExternalLinkAlt />}
              variant="ghost" size="sm" />
          </Tooltip>}
          <ModalCloseButton position="static" aria-label={t('about.closeFigure')} />
        </HStack>
        <ModalBody p={2} bg="white" overflow="auto" maxH="80vh">
          {src && <Image src={src} alt={alt} w="full" maxH="76vh" objectFit="contain" />}
        </ModalBody>
      </ModalContent>
    </Modal>
  )
}
