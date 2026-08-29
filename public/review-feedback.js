(() => {
  const widgets = document.querySelectorAll('[data-review-feedback]')

  for (const widget of widgets) {
    const playerName = widget.dataset.playerName || 'Player'
    const choices = [...widget.querySelectorAll('input[type="radio"]')]
    const correctionWrap = widget.querySelector('.review-feedback-correction')
    const correction = widget.querySelector('[data-review-correction]')
    const artwork = widget.querySelector('[data-review-artwork]')
    const prepare = widget.querySelector('[data-review-prepare]')
    const result = widget.querySelector('[data-review-result]')
    const handoff = widget.querySelector('[data-review-handoff]')
    const copy = widget.querySelector('[data-review-copy]')
    const email = widget.querySelector('[data-review-email]')
    const status = widget.querySelector('[data-review-status]')

    const selectedChoice = () => choices.find((choice) => choice.checked)

    const responseText = () => {
      const selected = selectedChoice()
      const lines = [`${playerName} — profile review`, '', `Profile review: ${selected?.value || ''}`]
      if (selected?.value === 'I spotted something' && correction.value.trim()) {
        lines.push(`Correction: ${correction.value.trim()}`)
      }
      if (artwork.value.trim()) lines.push(`Illustration note: ${artwork.value.trim()}`)
      return lines.join('\n')
    }

    for (const choice of choices) {
      choice.addEventListener('change', () => {
        const needsCorrection = selectedChoice()?.value === 'I spotted something'
        correctionWrap.hidden = !needsCorrection
        prepare.disabled = false
        result.hidden = true
        handoff.hidden = true
        status.textContent = ''
        if (needsCorrection) correction.focus()
      })
    }

    prepare.addEventListener('click', () => {
      if (selectedChoice()?.value === 'I spotted something' && !correction.value.trim()) {
        status.textContent = 'Add a quick note about what we should change.'
        correction.focus()
        return
      }

      const reply = responseText()
      result.textContent = reply
      result.hidden = false
      handoff.hidden = false
      email.href = `mailto:baseball@shesonfirst.com?subject=${encodeURIComponent(`${playerName} profile review`)}&body=${encodeURIComponent(reply)}`
      status.textContent = 'That’s it — your reply is ready.'
    })

    copy.addEventListener('click', async () => {
      try {
        await navigator.clipboard.writeText(responseText())
        status.textContent = 'Copied. Paste it into the Instagram conversation.'
      } catch {
        status.textContent = 'Select the prepared reply above to copy it.'
      }
    })
  }
})()
