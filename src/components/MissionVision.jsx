import React from "react";
import { motion } from "framer-motion";
import ourMissionImage from "../assets/images/home/our mission.png";
import ourVisionImage from "../assets/images/home/Our Vision.png";
import ourGoalImage from "../assets/images/home/Our Goal.png";

const cards = [
  {
    image: ourMissionImage,
    title: "Our Mission",
    description:
      "At Nexlife International, our mission is clear: we aim to improve lives by providing affordable, high-quality pharmaceutical solutions to healthcare providers worldwide. We are committed to bridging the gap between pharmaceutical innovation and accessibility.",
  },
  {
    image: ourVisionImage,
    title: "Our Vision",
    description:
      "At Nexlife International, our vision is to enhance global access to high-quality, affordable pharmaceutical products. We envision a world where quality healthcare is accessible to everyone, regardless of geographical boundaries.",
  },
  {
    image: ourGoalImage,
    title: "Our Goal",
    description:
      "At Nexlife International, our overarching goal is to lead the pharmaceutical export industry through innovation, reliability, and customer-centric approaches. We strive to become the most trusted partner in global pharmaceutical trade.",
  },
];

const MissionVision = () => (
  <section className="py-20 bg-gradient-to-br from-gray-50 to-blue-50">
    <div className="container-custom">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="text-center mb-14"
      >
        <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-3">Our Core Values</h2>
        <div className="h-1.5 w-24 bg-primary-500 mx-auto rounded-full mb-6" />
        <p className="text-slate-600 max-w-2xl mx-auto text-lg">
          Understanding our mission, vision, and goals helps you know what drives us forward.
        </p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {cards.map((card, i) => (
          <motion.div
            key={card.title}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.12, duration: 0.6 }}
            className="bg-white rounded-2xl shadow-sm border border-slate-100 p-8 hover:shadow-xl transition-shadow duration-300 flex flex-col"
          >
            <div className="w-14 h-14 mb-5">
              <img src={card.image} alt={card.title} className="w-full h-full object-contain" loading="lazy" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-3">{card.title}</h3>
            <p className="text-slate-600 leading-relaxed flex-1">{card.description}</p>
          </motion.div>
        ))}
      </div>
    </div>
  </section>
);

export default MissionVision;
