# 01_page_01

Good morning, everyone. Today I'm pleased to present our work on adaptive multimode process monitoring, based on a novel dictionary learning approach that jointly addresses mode matching and similarity preservation. This work has been published in IEEE Transactions on Cybernetics in 2023, and represents a collaboration from researchers at Central South University. Over the next few minutes, I'll walk you through the problem, our proposed JMSDL method, experimental results, and conclusions.

---

# 02_page_02

Let me walk you through the structure of today's presentation. We'll cover four main parts, starting with the problem and motivation — why multimode process monitoring is a real challenge in industrial settings, and what's missing in current approaches. Then we'll dive into our proposed methodology, JMSDL, which jointly addresses model mismatch and catastrophic forgetting in a unified framework. After that, I'll present experimental results across three benchmarks — numerical simulation, the CSTH process, and a real zinc roasting plant — to demonstrate JMSDL's superior performance. Finally, we'll wrap up with conclusions, limitations, and directions for future work.

---

# 03_page_03

Let's now examine the core challenge this paper addresses. Real industrial processes, like zinc roasting, operate across multiple distinct modes — efficient, healthy, over-decomposition, and under-oxidation — and new modes emerge continuously as operating conditions shift. The fundamental problem is twofold: first, model mismatch occurs when an existing model cannot represent a new mode's data distribution, leading to false alarms and missed detections. Second, and more critically, catastrophic forgetting happens when online updating methods overwrite previously learned knowledge while adapting to new modes, causing the system to forget patterns it once recognized well. Together, these two problems severely degrade monitoring performance in real industrial environments.

---

# 04_page_04

Now let's examine the existing methods and understand why none of them adequately address the challenges of multimodal process monitoring. The first approach builds a separate model for each operation mode, like mPCA — while conceptually straightforward, the model count grows linearly with the number of modes, making it unscalable when new modes emerge continuously. The second approach trains a single global dictionary using data from all modes — this suffers from statistical averaging, where mode-specific features get diluted and per-mode accuracy suffers. The third approach incrementally updates the dictionary online, but this leads to catastrophic forgetting: the model overwrites its knowledge of old modes when learning new ones. The critical insight is that no existing method simultaneously solves both model mismatch and catastrophic forgetting — and that is exactly the gap our proposed JMSDL method is designed to fill.

---

# 05_page_05

Now we arrive at the heart of our approach. Jointly Mode-Matching and Similarity-Preserving Dictionary Learning, or JMSDL for short. This method is designed to solve two fundamental problems in multimode process monitoring: model mismatch and catastrophic forgetting. The framework takes the old dictionary and new mode data, optimizes them jointly, and produces a new dictionary that both represents the new mode accurately and preserves knowledge of previously learned modes. The workflow is sequential — starting with K-SVD for the first mode, then applying JMSDL for each subsequent mode that appears.

---

# 06_page_06

Now that we have an overview of the JMSDL framework, let's dive into the core optimization problem that makes it work. The objective function consists of three carefully designed terms, each serving a distinct purpose. The first term minimizes the reconstruction error to ensure the new dictionary can faithfully represent the new mode data. The second term, shown in orange, is the key innovation — it uses the trace of the similarity matrix to force the new dictionary to stay close to the old one, effectively preserving previously learned knowledge. The third term enforces sparsity through L1 regularization, preventing overfitting. What makes this approach particularly powerful is that the similarity preservation term prevents catastrophic forgetting without needing access to old training data, enabling truly continual learning across an arbitrary number of process modes. The optimization is solved via an alternating scheme: first update the dictionary with W fixed, then update the sparse codes with the dictionary fixed, iterating until convergence.

---

# 07_page_07

Now let's walk through the optimization algorithm and online monitoring framework. The JMSDL algorithm follows a three-step alternating optimization procedure: first fixing the sparse coefficient matrix W and updating the dictionary Dn through matrix decomposition, then fixing Dn and updating W using orthogonal matching pursuit, and iterating these two steps until convergence. The convergence criterion is straightforward — we stop when the change in Dn between successive iterations falls below a small epsilon threshold. What makes this algorithm particularly elegant is highlighted in the insight box: the similarity-preserving term — lambda one times the trace of I minus Do transpose Dn — prevents catastrophic forgetting without requiring us to store any historical training data, which is a major advantage for continuous streaming industrial applications. For online monitoring, we first establish a control limit R_tr from training data using kernel density estimation, then for each new incoming sample, we find the best-matching mode dictionary, compute the index of reconstruction error, and compare it against the control limit to determine whether a fault has occurred.

---

# 08_page_08

Now let's look at the numerical simulation results, which serve as the first and most controlled validation of our method. We set up four distinct data modes with twenty-dimensional features and introduced a plus-four bias fault to test detection performance. As the grouped bar chart shows, JMSDL achieves a ninety-seven percent average fault detection rate across all four modes—significantly higher than mPCA at eighty-six percent, LCDL at eighty percent, and ODL at eighty-one percent. The most striking result is on Mode four, where dictionary learning drops to only forty-five percent due to catastrophic forgetting, while JMSDL maintains ninety-six percent. Equally important, the reconstruction error for Mode one remains low even after the model has learned Modes two through four, confirming that our similarity-preserving term effectively prevents knowledge loss.

---

# 09_page_09

Now let us move to the second experiment, the CSTH process benchmark. This is a well-known industrial benchmark with three operating modes and three fault cases: a bias on level, a multiplicative fault on temperature, and a multiplicative fault on flow. The grouped bar chart shows the fault detection rate for each method across these three fault scenarios. Across every fault case, JMSDL consistently achieves the highest FDR, exceeding ninety-five percent. In contrast, the standard dictionary learning method suffers significantly — its detection rate drops to around fifty-five percent on the third fault, confirming the catastrophic forgetting problem we discussed earlier.

What is particularly compelling is the mean reconstruction error table shown below. D₃, the dictionary learned last, maintains low MRE across all three modes — zero point five one for mode one, zero point four five for mode two, and zero point three nine for mode three. This is the direct evidence that JMSDL successfully preserves knowledge of earlier modes while learning new ones. The earlier dictionaries D₁ and D₂ show high MRE on modes they were not trained on, which is expected; but D₃'s uniformly low error proves that the similarity-preserving term in the objective function is working exactly as designed.

---

# 10_page_10

Now let's turn to the real-world validation — the industrial roasting process at a zinc smelting plant. This is where theoretical advantages meet actual operating conditions. The plant runs in four distinct modes depending on feed composition and furnace conditions, and we tested all five methods across every mode. The results are decisive: JMSDL achieves an average fault detection rate of ninety-two percent across all four modes, with the lowest false alarm rate in every single case. Notice especially what happens on Mode 4 — the most challenging operating condition. Dictionary learning catastrophically forgets and drops to just twenty-two percent detection, while ODL also struggles with high false alarms. JMSDL maintains consistent performance because its similarity-preserving term keeps the dictionary stable even as new modes are learned. This isn't just a lab result — the roasting process data comes from real industrial sensors, and the improvement translates directly to fewer missed faults and less production downtime.

---

# 11_page_11

Now let's bring all the experimental results together for a direct comparison. Across all three benchmarks — numerical simulation, CSTH process, and the real roasting plant — JMSDL consistently achieves the highest fault detection rate, averaging over ninety-five percent, while maintaining the lowest false alarm rate at under five percent. More importantly, it is the only dictionary-based method that completely avoids catastrophic forgetting. LCDL also avoids forgetting, but its detection rate is significantly lower. Methods like DL and ODL suffer from severe performance drops when new modes are introduced, as their dictionaries overwrite previously learned knowledge. The one caveat is that JMSDL requires mode labels during training, which means it is a supervised approach — a limitation we will address in our future work.

---

# 12_page_12

Let me now summarize the key contributions and future directions of our work. In conclusion, JMSDL successfully solves two fundamental challenges in multimode process monitoring. First, the mode-matching term ensures that each new dictionary accurately represents its target mode data, achieving high fault detection rates across all operating modes. Second, the similarity-preserving term effectively prevents catastrophic forgetting without requiring storage of historical data — the reconstruction error for mode one stays low even after learning modes two through four. Across all three benchmarks, including the real-world zinc roasting process, JMSDL consistently achieves the highest average FDR and the lowest FAR compared to existing methods. Looking ahead, we see three promising directions. First, introducing fine-grained similarity with per-atom weights could further improve reconstruction accuracy. Second, extending to unsupervised or semi-supervised mode identification would make JMSDL applicable to processes where mode labels are unavailable. And third, developing an online adaptive learning framework would enable truly continuous monitoring in dynamic industrial environments.

---

# 13_page_13

Now let's briefly go over the key references that form the foundation of this work. The K-SVD algorithm by Aharon and colleagues in 2006 established the foundation for overcomplete dictionary learning in sparse representation, which our method builds upon. More recently, Huang's online dictionary learning approach from 2021 addressed fault detection in industrial processes, though it suffers from catastrophic forgetting when new modes emerge. The local coordinate dictionary learning method by Ning in 2015 and the multi-model PCA approach by Xu in 2014 represent the existing state of the art, each with their own limitations that our JMSDL method directly addresses. These four works span the critical evolution from single-mode to multimode process monitoring.

---

# 14_page_14

Thank you for your attention. I hope this presentation has clearly demonstrated how JMSDL addresses the dual challenges of model mismatch and catastrophic forgetting in multimode process monitoring. I'm happy to take any questions you may have about the methodology, experimental setup, or potential applications in your own industrial processes.