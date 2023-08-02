// css must be loaded synchronously so the display will be consistent
import './index.scss';

bootstrap();

async function bootstrap() {
  const { bootstrap } = await import(/* webpackChunkName: "bootstrap" */ './bootstrapper');

  try {
    await bootstrap();
  } catch (e) {
    // TODO: update DOM to show the error
    console.error(e);
  }
}
