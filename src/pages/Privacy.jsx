import React from "react";
import { motion } from "framer-motion";
import { Shield, Lock, Eye, FileText, Users, Database } from "lucide-react";

const Privacy = () => {
  const lastUpdated = "January 11, 2026";

  const sections = [
    {
      icon: FileText,
      title: "Information We Collect",
      content: [
        "Personal Information: Name, email address, phone number, and company details when you contact us or submit inquiries.",
        "Cookies: We use cookies and similar tracking technologies to track activity on our website and hold certain information.",
      ],
    },
    {
      icon: Database,
      title: "How We Use Your Information",
      content: [
        "To provide and maintain our services",
        "To notify you about changes to our services",
        "To provide customer support",
        "To gather analysis or valuable information to improve our services",
        "To monitor the usage of our services",
        "To detect, prevent and address technical issues",
        "To send you marketing and promotional communications (with your consent)",
      ],
    },
    {
      icon: Lock,
      title: "Data Security",
      content: [
        "We implement appropriate technical and organizational security measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction.",
        "We use SSL/TLS encryption for data transmission.",
        "Access to personal data is restricted to authorized personnel only.",
        "Regular security audits and updates are performed.",
      ],
    },
    {
      icon: Users,
      title: "Sharing Your Information",
      content: [
        "We do not sell, trade, or rent your personal information to third parties.",
        "We may share information with trusted service providers who assist us in operating our website and conducting our business.",
        "We may disclose your information when required by law or to protect our rights.",
      ],
    },
    {
      icon: Eye,
      title: "Your Rights",
      content: [
        "Access: You have the right to request copies of your personal data.",
        "Rectification: You have the right to request correction of inaccurate information.",
        "Erasure: You have the right to request deletion of your personal data.",
        "Restrict Processing: You have the right to request restriction of processing your personal data.",
        "Data Portability: You have the right to request transfer of your data to another organization.",
        "Object: You have the right to object to our processing of your personal data.",
      ],
    },
    {
      icon: Shield,
      title: "Cookie Policy",
      content: [
        "Essential Cookies: Required for the website to function properly.",
        "Analytics Cookies: Help us understand how visitors interact with our website.",
        "Marketing Cookies: Used to track visitors across websites for marketing purposes.",
        "You can control cookies through your browser settings.",
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
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl mb-6 shadow-xl">
            <Shield className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
            Privacy Policy
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Your privacy is important to us. This Privacy Policy explains how
            Nexlife International collects, uses, and protects your personal
            information.
          </p>
          <div className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-800 rounded-lg shadow-md">
            <FileText className="w-4 h-4 text-blue-600 dark:text-blue-400" />
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
            Nexlife International ("we," "our," or "us") is committed to
            protecting your privacy. This Privacy Policy describes how we
            collect, use, and safeguard your information when you visit our
            website{" "}
            <a
              href="https://www.nexlifeinternational.com"
              className="text-blue-600 dark:text-blue-400 hover:underline"
            >
              www.nexlifeinternational.com
            </a>{" "}
            or use our services.
          </p>
          <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
            By accessing or using our website, you agree to the terms of this
            Privacy Policy. If you do not agree with our policies and practices,
            please do not use our website.
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
                <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
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
                        <span className="flex-shrink-0 w-1.5 h-1.5 rounded-full bg-blue-600 dark:bg-blue-400 mt-2"></span>
                        <span className="leading-relaxed">{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Contact Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="mt-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl shadow-xl p-8 text-white"
        >
          <h2 className="text-2xl font-bold mb-4">Contact Us</h2>
          <p className="mb-4 text-blue-100">
            If you have any questions about this Privacy Policy or our data
            practices, please contact us:
          </p>
          <div className="space-y-2 text-blue-100">
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

        {/* Changes to Policy */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9 }}
          className="mt-8 bg-white dark:bg-slate-800 rounded-2xl shadow-xl p-8"
        >
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Changes to This Privacy Policy
          </h2>
          <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
            We may update our Privacy Policy from time to time. We will notify
            you of any changes by posting the new Privacy Policy on this page
            and updating the "Last Updated" date at the top of this Privacy
            Policy. You are advised to review this Privacy Policy periodically
            for any changes.
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default Privacy;
