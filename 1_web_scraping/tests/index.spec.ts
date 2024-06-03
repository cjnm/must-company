import { test, chromium } from '@playwright/test';

test('test', async ({ }) => {
  const browserContext = await chromium.launch({ headless: false });
  const page = await browserContext.newPage();

  test.slow();
  await page.goto('https://www.eais.go.kr/moct/awp/abb01/AWPABB01F01', { waitUntil: 'domcontentloaded' });
  await page.getByPlaceholder('아이디').click();
  await page.getByPlaceholder('아이디').fill('kinsu83');
  await page.getByPlaceholder('비밀번호').click();
  await page.getByPlaceholder('비밀번호').fill('kiminsu83!');
  await page.locator('#container').getByRole('button', { name: '로그인', exact: true }).click();

  await page.goto('https://www.eais.go.kr/moct/bci/aaa02/BCIAAA02L01', { waitUntil: 'domcontentloaded', timeout: 900000 });
  let searchButton = page.getByRole('button', { name: '도로명주소로 조회' });
  await searchButton.waitFor({ state: 'visible', timeout: 90000});
  await searchButton.click();

  await page.getByPlaceholder('검색어 입력 예) 한누리대로 411').click();
  await page.getByPlaceholder('검색어 입력 예) 한누리대로 411').fill('경기도 고양시 일산동구 강석로 152 강촌마을아파트 제701동 제2층 제202호');
  await page.getByRole('button', { name: '조회하기' }).click();
  await page.getByRole('button', { name: '선택' }).click();
  await page.getByRole('link', { name: '일반건축물 1건' }).click();
  await page.getByRole('checkbox', { name: 'Press Space to toggle row' }).check();
  await page.getByRole('button', { name: '건축물대장 발급 신청' }).click();
  await page.getByRole('button', { name: '신청하기' }).click();

  await browserContext.close();
});