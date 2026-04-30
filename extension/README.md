# Extensão Desbloqueio Inteligente Sync

Esta extensão sincroniza perguntas de uma planilha Google Sheets publicada em CSV com o protótipo aberto no navegador.

## Formato da planilha

Aceita o formato atual da planilha `Questões Tutor Inteligente`:

`Ano, Idade, Matéria, Pergunta, A, B, C, D, Correta, Nível, Tempo`

O app usa `A`, `B` e `C` por padrão. Se a coluna `D` estiver preenchida, ela também aparece como quarta alternativa e pode ser marcada como correta.

## Como publicar a planilha

1. Abra a planilha no Google Sheets.
2. Vá em `Arquivo > Compartilhar > Publicar na Web`.
3. Escolha a aba com as questões.
4. Selecione o formato `Valores separados por vírgulas (.csv)`.
5. Copie a URL gerada.

## Como instalar a extensão

1. Abra `chrome://extensions` ou `edge://extensions`.
2. Ative o modo de desenvolvedor.
3. Clique em `Carregar sem compactação`.
4. Selecione a pasta `extension`.
5. Se o app estiver aberto como `file://`, ative `Permitir acesso a URLs de arquivo` nos detalhes da extensão.

## Como sincronizar

1. Abra o app `index.html`.
2. Clique no ícone da extensão.
3. Cole a URL CSV publicada.
4. Clique em `Sincronizar com app aberto`.

O app atualiza o banco de questões local e inicia uma nova rodada com as perguntas sincronizadas.
