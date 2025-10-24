import React from 'react';

interface AboutProps {
  aboutImageUrl: string;
}

const About: React.FC<AboutProps> = ({ aboutImageUrl }) => {
  return (
    <div className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="lg:text-center">
          <h2 className="text-base text-school-gold font-semibold tracking-wide uppercase">Our History</h2>
          <p className="mt-2 text-3xl leading-8 font-extrabold tracking-tight text-school-blue sm:text-4xl">
            A Legacy of Excellence Since 1999
          </p>
        </div>

        <div className="mt-12 grid md:grid-cols-2 gap-12 items-center">
          <div>
              <img className="rounded-lg shadow-xl" src={aboutImageUrl} alt="Quaid-e-Millat Public School building" />
          </div>
          <div className="prose prose-lg text-gray-600">
            <p>
              Quaid-e-Millat Public School Ameerabad was established in <strong>1999</strong> with a profound vision to provide quality education and foster a generation of leaders. The foundation of this esteemed institution was laid by one of the community's most honored teachers, <strong>M.M.A. Hadi</strong>.
            </p>
            <p>
              Driven by a passion for teaching and a commitment to societal upliftment, Mr. Hadi envisioned a school that would not only impart knowledge but also instill strong moral and ethical values. His dedication was to create an accessible, inclusive, and nurturing environment where students from all backgrounds could thrive.
            </p>
            <p>
              Over the decades, the school has grown from a humble beginning into a beacon of learning in the region. We continue to uphold the principles set forth by our founder, adapting to modern educational practices while staying true to our core mission: to empower students to learn with purpose and leave ready to lead with integrity.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default About;