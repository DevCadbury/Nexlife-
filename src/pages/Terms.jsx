import React from "react";
import { motion } from "framer-motion";
import { FileText, Scale, AlertCircle, ShieldCheck, UserCheck, Ban } from "lucide-react";

const Terms = () => {
  const lastUpdated = "January 11, 2026";

  const sections = [
    {
      icon: UserCheck,
      title: "Acceptance of Terms",
      content: [
        "By accessing and using the Nexlife International website, you accept and agree to be bound by the terms and provisions of this agreement.",
        "If you do not agree to these Terms of Service, please do not use our website or services.",
        "We reserve the right to update or modify these terms at any time without prior notice.",
      ],
    },
    {
      icon: Scale,
      title: "Use of Website",
      content: [
        "You may use our website for lawful purposes only and in accordance with these Terms.",
        "You agree not to use the website in any way that violates any applicable national or international law or regulation.",
        "You may not use our website to transmit any malicious code, viruses, or harmful content.",
        "You may not attempt to gain unauthorized access to any portion of the website or any systems or networks.",
      ],
    },
    {
      icon: ShieldCheck,
      title: "Intellectual Property Rights",
      content: [
        "All content on this website, including text, graphics, logos, images, and software, is the property of Nexlife International and protected by intellectual property laws.",
        "You may not reproduce, distribute, modify, or create derivative works without our express written permission.",
        "Product images and descriptions are for reference only and may not represent the actual product appearance.",
        "Trademarks and brand names mentioned belong to their respective owners.",
      ],
    },
    {
      icon: FileText,
      title: "Product Information",
      content: [
        "We strive to ensure that product information on our website is accurate and up-to-date.",
        "However, we do not warrant that product descriptions or other content is accurate, complete, reliable, or error-free.",
        "Product availability is subject to change without notice.",
        "Prices and specifications may vary and are subject to confirmation at the time of inquiry or order.",
      ],
    },
    {
      icon: AlertCircle,
      title: "Limitation of Liability",
      content: [
        "Nexlife International shall not be liable for any direct, indirect, incidental, consequential, or punitive damages arising from your use of the website.",
        "We do not guarantee uninterrupted or error-free operation of the website.",
        "We are not responsible for any damages to your computer system or loss of data that results from downloading any content from the website.",
        "The website and its content are provided 'as is' without warranties of any kind.",
      ],
    },
    {
      icon: Ban,
      title: "Prohibited Activities",
      content: [
        "Attempting to interfere with the proper working of the website.",
        "Collecting or harvesting any personally identifiable information from the website.",
        "Using any automated system to access the website without permission.",
        "Engaging in any activity that could damage, disable, or impair the website.",
        "Impersonating any person or entity or misrepresenting your affiliation.",
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 pt-32 pb-20">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl mb-6 shadow-xl">
            <Scale className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
            Terms of Service
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Please read these Terms of Service carefully before using the
            Nexlife International website and services.
          </p>
          <div className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-800 rounded-lg shadow-md">
            <FileText className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
            <span className="text-sm text-gray-600 dark:text-gray-300">
              Last Updated: <span className="font-semibold text-gray-900 dark:text-white">{lastUpdated}</span>
            </span>
          </div>
        </motion.div>

        {/* Introduction */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl p-8 mb-8"
        >
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Introduction
          </h2>
          <p className="text-gray-600 dark:text-gray-300 leading-relaxed mb-4">
            Welcome to Nexlife International. These Terms of Service ("Terms")
            govern your use of our website located at{" "}
            <a
              href="https://www.nexlifeinternational.com"
              className="text-indigo-600 dark:text-indigo-400 hover:underline"
            >
              www.nexlifeinternational.com
            </a>{" "}
            and any related services provided by Nexlife International.
          </p>
          <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
            By accessing or using our website, you acknowledge that you have
            read, understood, and agree to be bound by these Terms. If you do
            not agree with any part of these Terms, you must not use our
            website.
          </p>
        </motion.div>

        {/* Sections */}
        <div className="space-y-6">
          {sections.map((section, index) => (
            <motion.div
              key={section.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 + index * 0.1 }}
              className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl p-8"
            >
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                  <section.icon className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1">
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                    {section.title}
                  </h2>
                  <ul className="space-y-3">
                    {section.content.map((item, idx) => (
                      <li
                        key={idx}
                        className="flex items-start gap-2 text-gray-600 dark:text-gray-300"
                      >
                        <span className="flex-shrink-0 w-1.5 h-1.5 rounded-full bg-indigo-600 dark:bg-indigo-400 mt-2"></span>
                        <span className="leading-relaxed">{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Third Party Links */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="mt-8 bg-white dark:bg-slate-800 rounded-2xl shadow-xl p-8"
        >
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Third-Party Links
          </h2>
          <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
            Our website may contain links to third-party websites or services
            that are not owned or controlled by Nexlife International. We have
            no control over, and assume no responsibility for, the content,
            privacy policies, or practices of any third-party websites or
            services. We strongly advise you to read the terms and conditions
            and privacy policies of any third-party websites you visit.
          </p>
        </motion.div>

        {/* Governing Law */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9 }}
          className="mt-8 bg-white dark:bg-slate-800 rounded-2xl shadow-xl p-8"
        >
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Governing Law
          </h2>
          <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
            These Terms shall be governed and construed in accordance with the
            laws of India, without regard to its conflict of law provisions. Any
            disputes arising from these Terms or your use of the website shall
            be subject to the exclusive jurisdiction of the courts located in
            Vadodara, Gujarat, India.
          </p>
        </motion.div>

        {/* Contact Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.0 }}
          className="mt-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl shadow-xl p-8 text-white"
        >
          <h2 className="text-2xl font-bold mb-4">Contact Us</h2>
          <p className="mb-4 text-indigo-100">
            If you have any questions about these Terms of Service, please
            contact us:
          </p>
          <div className="space-y-2 text-indigo-100">
            <p>
              <strong className="text-white">Email:</strong>{" "}
              <a
                href="mailto:Info@nexlifeinternational.com"
                className="hover:text-white transition-colors"
              >
                Info@nexlifeinternational.com
              </a>
            </p>
            <p>
              <strong className="text-white">Phone:</strong>{" "}
              <a
                href="tel:+919664843790"
                className="hover:text-white transition-colors"
              >
                +91 96648 43790
              </a>
            </p>
            <p>
              <strong className="text-white">Address:</strong> S-223, Angel
              Business Center, Ajwa Road, Vadodara, Gujarat 390019, India
            </p>
          </div>
        </motion.div>

        {/* Changes to Terms */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.1 }}
          className="mt-8 bg-white dark:bg-slate-800 rounded-2xl shadow-xl p-8"
        >
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Changes to These Terms
          </h2>
          <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
            We reserve the right to modify or replace these Terms at any time at
            our sole discretion. We will provide notice of any material changes
            by updating the "Last Updated" date at the top of these Terms. Your
            continued use of the website after any changes constitutes your
            acceptance of the new Terms.
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default Terms;
