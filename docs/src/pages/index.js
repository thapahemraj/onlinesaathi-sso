import clsx from 'clsx';
import Link from '@docusaurus/Link';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import Layout from '@theme/Layout';
import Heading from '@theme/Heading';
import styles from './index.module.css';

function HomepageHeader() {
  const { siteConfig } = useDocusaurusContext();
  return (
    <header className={clsx('hero', styles.heroBanner)}>
      <div className="container">
        <Heading as="h1" className={styles.heroTitle}>
          {siteConfig.title}
        </Heading>
        <p className={styles.heroSubtitle}>{siteConfig.tagline}</p>
        <div className={styles.buttons}>
          <Link
            className="button button--secondary button--lg"
            to="/docs/user-guide">
            User Guide
          </Link>
          <Link
            className="button button--outline button--secondary button--lg"
            to="/docs/developer-guide">
            Developer API
          </Link>
        </div>
      </div>
    </header>
  );
}

const FeatureList = [
  {
    title: 'Single Sign-On',
    description: (
      <>
        Access all your favorite applications with a single set of secure credentials.
        No more password fatigue.
      </>
    ),
  },
  {
    title: 'Biometric Security',
    description: (
      <>
        Sign in with just a touch or a glance. We support WebAuthn for
        true passwordless authentication.
      </>
    ),
  },
  {
    title: 'Enterprise Ready',
    description: (
      <>
        Multi-tenancy, RBAC, and granular audit logs. Designed for businesses
        that care about identity at scale.
      </>
    ),
  },
];

function Feature({ title, description }) {
  return (
    <div className={clsx('col col--4')}>
      <div className={styles.featureCard}>
        <div className="text--center padding-horiz--md">
          <Heading as="h3">{title}</Heading>
          <p>{description}</p>
        </div>
      </div>
    </div>
  );
}

export default function Home() {
  const { siteConfig } = useDocusaurusContext();
  return (
    <Layout
      title={`${siteConfig.title} - Next Gen Identity`}
      description="Modern Identity Provider & SSO Solution for seamless and secure authentication.">
      <HomepageHeader />
      <main>
        <section className={styles.features}>
          <div className="container">
            <div className="row">
              {FeatureList.map((props, idx) => (
                <Feature key={idx} {...props} />
              ))}
            </div>
          </div>
        </section>

        <section className="padding-vert--xl text--center">
          <div className="container">
            <Heading as="h2">Build the future of identity</Heading>
            <p className="margin-bottom--lg">Join thousands of developers building secure applications with Online Saathi.</p>
            <Link className="button button--primary button--lg" to="/blog">
              Read our latest news
            </Link>
          </div>
        </section>
      </main>
    </Layout>
  );
}
