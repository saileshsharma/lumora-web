import React from 'react';
import styles from './TeamPage.module.css';

interface TeamMember {
  name: string;
  role: string;
  description: string;
  image?: string;
}

export const TeamPage: React.FC = () => {
  const team: TeamMember[] = [
    {
      name: 'Kyn Sze',
      role: 'Tech Lead',
      description: 'Leading technical architecture and development of AI-powered fashion solutions.',
    },
    {
      name: 'Sailesh Sharma',
      role: 'Tech Lead',
      description: 'Driving innovation in machine learning models and backend infrastructure.',
    },
    {
      name: 'Simon Armstrong',
      role: 'Program Manager',
      description: 'Orchestrating project delivery and ensuring alignment with business goals.',
    },
    {
      name: 'Craig Acquaye',
      role: 'Legal and Compliance Manager',
      description: 'Ensuring regulatory compliance and protecting user privacy across all platforms.',
    },
    {
      name: 'Taj-Mahal Y Aquino',
      role: 'Product Manager',
      description: 'Defining product vision and creating exceptional user experiences.',
    },
    {
      name: 'Iris Keum',
      role: 'Product Manager',
      description: 'Translating user needs into innovative fashion-tech features.',
    },
    {
      name: 'Saurabh Mehta',
      role: 'QA Lead',
      description: 'Guaranteeing quality through rigorous testing and quality assurance processes.',
    },
  ];

  return (
    <div className={styles.container}>
      <div className={styles.hero}>
        <h1 className={styles.title}>Meet Our Team</h1>
        <p className={styles.subtitle}>
          The talented individuals behind Lumora's AI-powered fashion platform
        </p>
      </div>

      <div className={styles.content}>
        <div className={styles.intro}>
          <h2 className={styles.sectionTitle}>About Lumora</h2>
          <p className={styles.description}>
            Lumora is a cutting-edge AI fashion assistant powered by OpenAI GPT-4o and NanobananaAPI.
            We combine artificial intelligence with fashion expertise to help you discover your perfect style,
            rate your outfits, and get personalized recommendations tailored to any occasion.
          </p>
        </div>

        <div className={styles.teamSection}>
          <h2 className={styles.sectionTitle}>Our Team</h2>
          <div className={styles.teamGrid}>
            {team.map((member) => (
              <div key={member.name} className={styles.memberCard}>
                <div className={styles.memberInitial}>
                  {member.name.split(' ').map(n => n[0]).join('')}
                </div>
                <div className={styles.memberInfo}>
                  <h3 className={styles.memberName}>{member.name}</h3>
                  <p className={styles.memberRole}>{member.role}</p>
                  <p className={styles.memberDescription}>{member.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className={styles.mission}>
          <h2 className={styles.sectionTitle}>Our Mission</h2>
          <p className={styles.description}>
            To democratize fashion expertise through AI technology, making personalized style guidance
            accessible to everyone. We believe that everyone deserves to look and feel their best,
            and our platform empowers users to make confident fashion choices with the help of
            cutting-edge artificial intelligence.
          </p>
        </div>

        <div className={styles.tech}>
          <h2 className={styles.sectionTitle}>Technology</h2>
          <div className={styles.techGrid}>
            <div className={styles.techCard}>
              <div className={styles.techIcon}>🤖</div>
              <h3 className={styles.techName}>OpenAI GPT-4o</h3>
              <p className={styles.techDescription}>
                Advanced language model providing intelligent fashion analysis and recommendations
              </p>
            </div>
            <div className={styles.techCard}>
              <div className={styles.techIcon}>🎨</div>
              <h3 className={styles.techName}>NanobananaAPI</h3>
              <p className={styles.techDescription}>
                Specialized fashion API for accurate outfit analysis and style suggestions
              </p>
            </div>
            <div className={styles.techCard}>
              <div className={styles.techIcon}>⚡</div>
              <h3 className={styles.techName}>Real-time Processing</h3>
              <p className={styles.techDescription}>
                Lightning-fast AI processing for instant fashion feedback and insights
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
