# Integração iOS

No iPhone, apps comuns não podem desenhar uma tela de cobertura livre por cima de outros apps como no Android.

O caminho correto para controle parental é usar os frameworks da Apple:

- FamilyControls
- ManagedSettings
- DeviceActivity

Fluxo recomendado:

1. Responsável autoriza o app com Family Sharing e Family Controls.
2. O app configura limites ou janelas de uso com Screen Time.
3. Ao chegar no momento de validação educativa, o app mostra `EducationGateView`.
4. Depois da pontuação 10/10, o app registra o resultado no painel dos responsáveis.
5. A liberação de apps no iOS deve respeitar as APIs de Screen Time, não um overlay arbitrário.

Isso reduz risco de reprovação na App Store e mantém o app dentro do modelo de privacidade da Apple.
