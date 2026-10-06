import { useEffect, useMemo } from 'react'
import { Box, Flex, Heading, HStack, IconButton, Link, Text, useColorMode } from '@chakra-ui/react'
import { Link as RouterLink, useParams } from 'react-router-dom'
import { FaArrowLeft, FaArrowUp, FaChevronDown } from 'react-icons/fa'
import { useTranslation } from 'react-i18next'
import { useLocalizedData } from '@/hooks/useLocalizedData'
import { terminalPalette } from '@/config/theme'
import { withBase } from '@/utils/asset'

export default function ArticleDetail() {
  const { slug } = useParams()
  const { articles, siteOwner } = useLocalizedData()
  const { t, i18n } = useTranslation()
  const isChinese = i18n.language.startsWith('zh')
  const { colorMode } = useColorMode()
  const colors = terminalPalette.colors(colorMode === 'dark')
  const article = articles.find(post => post.slug === slug)

  const content = useMemo(() => {
    const document = new DOMParser().parseFromString(article?.body || '', 'text/html')
    const headings = [...document.querySelectorAll('h2,h3')].map((heading, index) => {
      heading.id ||= `section-${index + 1}`
      return { id: heading.id, text: heading.textContent || '', sub: heading.tagName === 'H3' }
    })
    document.querySelectorAll('[src],[poster],a[href]').forEach(element => {
      for (const attribute of ['src', 'poster', 'href']) {
        const value = element.getAttribute(attribute)
        if (value?.startsWith('/') && !value.startsWith('//')) {
          element.setAttribute(attribute, withBase(value) || value)
        }
      }
    })
    return { html: document.body.innerHTML, headings }
  }, [article?.body])

  useEffect(() => {
    const previousTitle = document.title
    document.title = `${article?.title || t('articles.notFound')} | ${siteOwner.name.full}`
    return () => { document.title = previousTitle }
  }, [article?.title, siteOwner.name.full, t])

  const tableOfContents = content.headings.map(heading => (
    <Link key={heading.id} href={`#${heading.id}`} color={colors.secondary} fontSize="xs" pl={heading.sub ? 3 : 0} py={1}>
      {heading.text}
    </Link>
  ))

  if (!article) {
    return <Box maxW="1000px" mx="auto" py={12}>
      <Heading size="md" mb={4}>{t('articles.notFound')}</Heading>
      <Text mb={6}>{t('articles.notFoundDescription')}</Text>
      <Link as={RouterLink} to="/articles">{t('articles.back')}</Link>
    </Box>
  }

  return (
    <Box maxW="1200px" mx="auto" py={[5, 8]}>
      <Link as={RouterLink} to="/articles" display="inline-flex" alignItems="center" gap={2} mb={5} fontSize="xs">
        <FaArrowLeft /> {t('articles.back')}
      </Link>
      <Box bg={colors.bg} color={colors.text} border="1px solid" borderColor={colors.border} borderRadius="md" overflow="hidden">
        <Flex bg={colors.header} borderBottom="1px solid" borderColor={colors.border} px={[3, 5]} py={3} gap={3} align="center" wrap="wrap">
          <HStack spacing={1.5} aria-hidden="true">
            {['#bf616a', '#ebcb8b', '#a3be8c'].map(color => <Box key={color} w="9px" h="9px" borderRadius="full" bg={color} />)}
          </HStack>
          <Text fontFamily="mono" fontSize="xs" color={colors.command} overflowWrap="anywhere">~/blog/{article.slug}.md</Text>
          {article.draft && <Text fontSize="2xs" color={colors.highlight} ml="auto">{t('articles.draft')}</Text>}
        </Flex>
        <Box px={[4, 6, 10]} pt={[6, 8]}>
          <Text color={colors.secondary} fontSize="xs">
            {new Date(article.date || '').toLocaleDateString(isChinese ? 'zh-CN' : 'en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
            {' / '}{siteOwner.name.display}
          </Text>
          <Heading as="h1" fontSize={['xl', '2xl', '3xl']} lineHeight="1.5" mt={3} mb={4} color={colors.text}>{article.title}</Heading>
          <Flex gap={4} wrap="wrap" color={colors.prompt} fontSize="xs" pb={6} borderBottom="1px solid" borderColor={colors.border}>
            {article.tags.map(tag => <Text key={tag}>{tag}</Text>)}
          </Flex>
        </Box>
        <Box display={{ base: 'block', lg: 'grid' }} gridTemplateColumns="minmax(0, 1fr) 200px" gap={10} px={[4, 6, 10]} py={[6, 8]}>
          <Box minW={0}>
            <Box as="details" display={{ base: 'block', lg: 'none' }} mb={7} className="article-mobile-toc">
              <Box as="summary" display="flex" justifyContent="space-between" alignItems="center" cursor="pointer" color={colors.command} fontSize="xs">
                {isChinese ? '目录' : 'Contents'} <FaChevronDown />
              </Box>
              <Flex direction="column" gap={2} mt={4}>{tableOfContents}</Flex>
            </Box>
            <Box className="article-prose" dangerouslySetInnerHTML={{ __html: content.html }} />
          </Box>
          <Box as="aside" display={{ base: 'none', lg: 'block' }} position="sticky" top="100px" alignSelf="start" borderLeft="1px solid" borderColor={colors.border} pl={5}>
            <Text fontSize="xs" color={colors.command} mb={3}>{isChinese ? '目录' : 'Contents'}</Text>
            <Flex as="nav" aria-label={isChinese ? '文章目录' : 'Contents'} direction="column" gap={2}>{tableOfContents}</Flex>
          </Box>
        </Box>
        <Flex justify="space-between" align="center" gap={5} mx={[4, 6, 10]} py={5} borderTop="1px solid" borderColor={colors.border}>
          <Link as={RouterLink} to="/articles" fontSize="xs" color={colors.command}>{t('articles.back')}</Link>
          <IconButton aria-label={isChinese ? '返回顶部' : 'Back to top'} title={isChinese ? '返回顶部' : 'Back to top'} icon={<FaArrowUp />} variant="ghost" size="sm" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} />
        </Flex>
      </Box>
    </Box>
  )
}
