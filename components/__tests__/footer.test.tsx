import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Footer } from '../footer'

describe('Footer', () => {
  describe('Portuguese locale', () => {
    it('renders project section header', () => {
      render(<Footer locale="pt" />)
      // Text appears twice (header and nav link), so use getAllByText
      const elements = screen.getAllByText('Sobre o Projeto')
      expect(elements.length).toBeGreaterThanOrEqual(1)
      // The header should be an h3
      const header = elements.find((el) => el.tagName === 'H3')
      expect(header).toBeInTheDocument()
    })

    it('renders author section header', () => {
      render(<Footer locale="pt" />)
      expect(screen.getByText('Autor')).toBeInTheDocument()
    })

    it('renders site map section header', () => {
      render(<Footer locale="pt" />)
      expect(screen.getByText('Mapa do Site')).toBeInTheDocument()
    })

    it('renders navigation links in Portuguese', () => {
      render(<Footer locale="pt" />)
      expect(screen.getByText('Início')).toBeInTheDocument()
      expect(screen.getByText('Agentes de IA')).toBeInTheDocument()
      expect(screen.getByText('Manifesto')).toBeInTheDocument()
    })

    it('renders policy links in Portuguese', () => {
      render(<Footer locale="pt" />)
      expect(screen.getByText('Política de Privacidade')).toBeInTheDocument()
      expect(screen.getByText('Política de Cookies')).toBeInTheDocument()
    })
  })

  describe('English locale', () => {
    it('renders project section header', () => {
      render(<Footer locale="en" />)
      // Header text
      expect(
        screen.getByRole('heading', { level: 3, name: 'About the Project' })
      ).toBeInTheDocument()
    })

    it('renders author section header', () => {
      render(<Footer locale="en" />)
      expect(screen.getByText('Author')).toBeInTheDocument()
    })

    it('renders site map section header', () => {
      render(<Footer locale="en" />)
      expect(screen.getByText('Site Map')).toBeInTheDocument()
    })

    it('renders navigation links in English', () => {
      render(<Footer locale="en" />)
      expect(screen.getByText('Home')).toBeInTheDocument()
      expect(screen.getByText('AI Agents')).toBeInTheDocument()
      expect(screen.getByText('About')).toBeInTheDocument()
    })

    it('renders policy links in English', () => {
      render(<Footer locale="en" />)
      expect(screen.getByText('Privacy Policy')).toBeInTheDocument()
      expect(screen.getByText('Cookie Policy')).toBeInTheDocument()
    })
  })

  describe('author information', () => {
    it('renders author name', () => {
      render(<Footer locale="pt" />)
      expect(screen.getByText('Anderson Henrique da Silva')).toBeInTheDocument()
    })

    it('renders IFSULDEMINAS link', () => {
      render(<Footer locale="pt" />)
      const link = screen.getByText('IFSULDEMINAS - Campus Muzambinho')
      expect(link).toHaveAttribute('href', 'https://www.muz.ifsuldeminas.edu.br/')
    })

    it('renders GitHub link', () => {
      render(<Footer locale="pt" />)
      const link = screen.getByText('💻 GitHub')
      expect(link).toHaveAttribute('href', 'https://github.com/anderson-ntlabs')
    })

    it('renders LinkedIn link', () => {
      render(<Footer locale="pt" />)
      const link = screen.getByText('💼 LinkedIn')
      expect(link).toHaveAttribute('href', 'https://www.linkedin.com/in/anderson-h-silva95/')
    })

    it('renders email link', () => {
      render(<Footer locale="pt" />)
      const link = screen.getByText('✉️ andersonhs27@gmail.com')
      expect(link).toHaveAttribute('href', 'mailto:andersonhs27@gmail.com')
    })
  })

  describe('navigation links', () => {
    it('renders correct href for home', () => {
      render(<Footer locale="pt" />)
      const link = screen.getByText('Início')
      expect(link).toHaveAttribute('href', '/pt')
    })

    it('renders correct href for agents', () => {
      render(<Footer locale="pt" />)
      const link = screen.getByText('Agentes de IA')
      expect(link).toHaveAttribute('href', '/pt/agents')
    })

    it('uses English locale in href', () => {
      render(<Footer locale="en" />)
      const link = screen.getByText('Home')
      expect(link).toHaveAttribute('href', '/en')
    })
  })

  describe('copyright', () => {
    it('renders current year', () => {
      render(<Footer locale="pt" />)
      const year = new Date().getFullYear()
      expect(screen.getByText(new RegExp(`© ${year}`))).toBeInTheDocument()
    })

    it('renders MIT license text in Portuguese', () => {
      render(<Footer locale="pt" />)
      expect(screen.getByText(/código aberto sob licença MIT/)).toBeInTheDocument()
    })

    it('renders MIT license text in English', () => {
      render(<Footer locale="en" />)
      expect(screen.getByText(/Open source project under MIT license/)).toBeInTheDocument()
    })
  })

  describe('external links', () => {
    it('external links open in new tab', () => {
      render(<Footer locale="pt" />)
      const link = screen.getByText('IFSULDEMINAS - Campus Muzambinho')
      expect(link).toHaveAttribute('target', '_blank')
      expect(link).toHaveAttribute('rel', 'noopener')
    })
  })
})
