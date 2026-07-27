# Adaptive_Multimode_Process_Monitoring_Based_on_Mode-Matching_and_Similarity-Preserving_Dictionary_Learning

3974 IEEE TRANSACTIONS ON CYBERNETICS, VOL. 53, NO. 6, JUNE 2023

## Adaptive Multimode Process Monitoring Based on Mode-Matching and Similarity-Preserving

## Dictionary Learning

, *Fellow,* *IEEE*, Weihua Gui, Keke Huang , Zui Tao, Yishun Liu, Bei Sun, Chunhua Yang , *Senior* *Member,* *IEEE* and Shiyan Hu I. INTRODUCTION ***Abstract *—In** **real** **industrial** **processes,** **factors,** **such** **as** **the** **change in manufacturing strategy and production technology lead**

# N

OWADAYS, industrial processes are becoming more and **to** **the** **creation** **of** **multimode** **industrial** **processes** **and** **the** **contin-** more complex, which leads to the fact that a small fault **uous** **emergence** **of** **new** **modes.** **Although** **the** **industrial** **SCADA** in large-scale industrial production may cause huge damage **system** **has** **accumulated** **a** **large** **amount** **of** **historical** **data,** **which** **can** **be** **used** **for** **modeling** **and** **monitoring** **multimode** **processes** to the entire system. In addition, most of the actual industrial **to** **a** **certain** **extent,** **it** **is** **difﬁcult** **for** **the** **model** **learned** **from** **his-** processes are carried out under extreme conditions, such as **torical** **data** **to** **adapt** **to** **emerging** **modes,** **resulting** **in** **the** **model** high temperature or high pressure. Some faults may lead to **mismatch.** **On** **the** **other** **hand,** **updating** **the** **model** **with** **data** industrial accidents such as toxic gas leaks, ﬁres, and explo- **from** **new** **modes** **allows** **the** **model** **to** **continuously** **match** **the** sions, resulting in economic losses and human casualties.

**new** **modes,** **but** **it** **may** **cause** **the** **model** **to** **lose** **the** **ability** **to** **rep-** **resent the historical modes, resulting in “catastrophic forgetting.”** Process monitoring can obtain the current state of the indus- **To** **address** **these** **problems,** **this** **article** **proposed** **a** **jointly** **mode-** trial process, and when a fault is monitored, the corresponding **matching and similarity-preserving dictionary learning (JMSDL)** alarm will be triggered to remind the operator to deal with the **method,** **which** **updated** **the** **model** **by** **learning** **the** **data** **of** **new** fault in time [1]–[4]. Therefore, it is particularly signiﬁcant to **modes, so that the model can adaptively match the newly emerged** **modes.** **At** **the** **same** **time,** **a** **similarity** **metric** **was** **put** **forward** **to** introduce effective process monitoring methods for industrial **guarantee** **the** **representation** **ability** **of** **the** **proposed** **method** **for** processes.

**historical** **data.** **A** **numerical** **simulation** **experiment,** **the** **CSTH** Process monitoring has become a major research topic, and **process** **experiment,** **and** **an** **industrial** **roasting** **process** **experi-** a variety of methods are proposed. Process monitoring meth- **ment indicated that the proposed JMSDL method can match new** ods can be classiﬁed into three categories: 1) model-based **modes while maintaining its performance on the historical modes** **accurately. In addition, the proposed method signiﬁcantly outper-** methods; 2) knowledge-based methods; and 3) data-driven **forms the state-of-the-art methods in terms of fault detection and** methods. Model-based methods build models based on indus- **false** **alarm** **rate.** trial production mechanisms [5], which are suitable for small ***Index*** ***Terms *—Adaptive** **model** **updating,** **dictionary** **learn-** systems with sufﬁcient mechanistic knowledge. Knowledge- **ing,** **model** **mismatch,** **multimode** **process** **modeling,** **process** based methods build models based on expert knowledge or **monitoring.** experience. Usually, it is time consuming, and there are sce- narios in which empirical knowledge is not accurate and reliable. Data-driven methods do not require precise ﬁrst- Manuscript received 26 February 2022; revised 10 May 2022; accepted 26 May 2022. Date of publication 10 June 2022; date of current version principle models and extensive process knowledge, relying 17 May 2023. This work was supported in part by the National Natural only on collected data to build mathematical models, which Science Foundation of China under Grant 62073340 and Grant 61860206014;

are simple and generic. In addition, with the development of in part by the Major Key Project of Peng Cheng Laboratory (PCL) under Grant PCL2021A09; in part by the National Key Research and Development the computer and sensor technology, a large amount of process Program of China under Grant 2019YFB1705300; in part by the Innovation- data is collected, providing enough information for data-driven Driven Plan in Central South University, China, under Grant 2019CX020;

process monitoring. Therefore, data-driven methods are widely and in part by the 111 Project, China, under Grant B17048. This article was recommended by Associate Editor T. Huang. *(Corresponding* *author:* used in modern complex industrial processes [6], [7]. There *Yishun* *Liu.)* have been some important advances in the ﬁeld of data-driven Keke Huang is with the School of Automation, Central South University, process monitoring. Li *et* *al.* [8] proposed a process moni- Changsha 410083, China, and also with Peng Cheng Laboratory, Shenzhen 518055, China (e-mail: huangkeke@csu.edu.cn).

toring method based on principal component analysis (PCA), Zui Tao, Yishun Liu, Bei Sun, Chunhua Yang, and Weihua Gui are with which promoted the development of multivariate statistical the School of Automation, Central South University, Changsha 410083, China process monitoring (MSPM). Some typical MSPM methods (e-mail: taozui21@csu.edu.cn; liuyishun@csu.edu.cn; sunbei@csu.edu.cn;

ychh@csu.edu.cn; gwh@csu.edu.cn).

have received a lot of attention [9]–[11]. Chen and Ge [12] Shiyan Hu is with the School of Electronics and Computer Science, innovatively developed support vector machine (SVM)-tree University of Southampton, Southampton SO17 1BJ, U.K.

(e-mail:

s.hu@soton.ac.uk).

and SVM-forest algorithms for imbalanced process monitor- Color versions of one or more ﬁgures in this article are available at ing. Jiang *et* *al.* [13] allowed the Bayesian analysis to be https://doi.org/10.1109/TCYB.2022.3178878.

applied to industrial data monitoring. These works reﬂect Digital Object Identiﬁer 10.1109/TCYB.2022.3178878 2168-2267 c⃝2022 IEEE. Personal use is permitted, but republication/redistribution requires IEEE permission.

See https://www.ieee.org/publications/rights/index.html for more information.

<!-- Page 2 -->

HUANG *et* *al.*: ADAPTIVE MULTIMODE PROCESS MONITORING 3975

The philosophy of the multiple model method is straightfor- ward by using multiple models to match each mode, which has been widely used due to its simple idea and good performance.

Zhao *et* *al.* [25] proposed a multiple PCA method to monitor industrial processes with multiple operating modes. Natarajan and Srinivasan [26] proposed a multimodel method to monitor the state of oil and gas production processes. Zhao *et* *al.* [27] proposed a multistage statistical analysis method for monitor- ing the penicillin culture process. However, the multiple model method also has obvious disadvantages. If new modes are con- Fig. 1.

Unimode and multimode data visualization. (a) Principal components tinuously generated, the number of models will continuously of unimode data. (b) Principal components of multimode data. For multimode grow and with high space complexity. In addition, such meth- data, different modes show different distributions.

ods often require a signiﬁcant amount of time to ﬁnd the most appropriate model to match the data when online monitoring the malleability of machine learning in the ﬁeld of process data arrives.

monitoring.

The global modeling method devotes to build a single model Dictionary learning is a powerful machine-learning method, to represent the data of all modes simultaneously. Hwang and the goal of which is to train a dictionary with the ability to Han [28] proposed a process monitoring method with multiple modes based on hierarchical clustering and PCA. Xu*et al.*[29] represent data. Each column of the dictionary matrix is called an atom, and a small number of atoms are used to repre- proposed a PCA mixture model for the early detection of vari- ous faults in multimode processes. Ning*et al.*[30] proposed a sent data linearly. Dictionary learning continues to develop for label-consistent dictionary learning (LCDL) method for mon- improving its effectiveness, and the K-SVD method [14], label itoring the chemical industry. The global modeling method consistent K-SVD method [15], supervised dictionary learn- solves the problem of an excessive number of models in the ing method [16], and discriminative K-SVD method [17] have multiple model method. However, when the number of modes been proposed. Some works consider the physical meaning of is large, the number of training samples can also be very large, atoms, such as low rank, nonstationary, etc., which impose leading to time consuming in training. Moreover, due to the these physical constraints on dictionary atoms and achieve statistical averaging effect, the global model may not accu- good results [18], [19]. But atoms are treated as abstract fea- rately represent each mode. In addition, when a new mode tures in this work. Dictionary learning has a wide range of applications in the ﬁeld of process monitoring. Peng*et al.*[20] appears, the previously trained model can no longer be used, and the new mode data should be added to the training set to proposed a method based on sparse modeling and dictio- retrain the model, which is a very tedious and time-consuming nary learning for monitoring non-Gaussian processes with multiple operating conditions. Huang *et* *al.* [21] proposed a process.

The online model updating method enables the model to distributed dictionary learning method for effectively monitor- constantly adapted to new modes. This type of method usu- ing modern industrial processes with complex, distributed, and high-dimensional characteristics. Huang *et* *al.* [22] proposed ally trains an initial model using historical data and updates the model online using data from the newly emerged mode, a kernel dictionary learning method for nonlinear process so that the model has a good representation of the new mode monitoring.

data. Jeng [31] proposed a recursive PCA and moving win- In the process industry, a mode is deﬁned as the process dow PCA technique to update the model and the control limit at a certain operating condition. The modes of actual indus- online. Huang*et al.*[32] developed an online dictionary learn- trial processes change due to, for example, market demand, ing (ODL)-based process monitoring technique. This type of product speciﬁcations, raw materials, manufacturing strategies, method enables model updates and solves the problem that and ﬂuctuations in the external environment, which leads to the model needs to be retrained when a new mode appears.

the continuous creation of new modes [23], [24]. Taking the However, online model updating methods are often not adapt- roasting process of a zinc smelting factory in Hunan Province, able to processes with large mode variations. Moreover, some China as an example, the roasting process can be divided online model updating methods may face the problem of into the efﬁcient condition and healthy condition due to the “catastrophic forgetting,” that is, as the model continuously process indicators and manufacturing strategies in different updates, it may lose its ability to represent the previous modes’ periods. If the conditions of the roasting process are classi- data. Fig. 2 shows the reconstruction results of the ODL ﬁed according to the chemical reactions, it can be divided into method for the multimode data in Fig 1. As the model is over-decomposition condition, under-oxidation condition, and updated, its reconstruction error of the previous data increases, bed deposition condition. Therefore, the roasting process data which is a typical phenomenon of “catastrophic forgetting.” is of complex mode. Multimode data are difﬁcult to model The reason for “catastrophic forgetting” is that the model may and monitor because their different modes have different dis- overwrite previously learned knowledge when it is updated or tribution characteristics, as shown in Fig. 1. To address this retrained. It introduces difﬁculties for process monitoring. If problem, there are currently three types of methods, includ- the updated model experiences “catastrophic forgetting,” the ing the multiple model method, global modeling method, and previous modes can no longer be monitored.

online model updating method.

<!-- Page 3 -->

3976 IEEE TRANSACTIONS ON CYBERNETICS, VOL. 53, NO. 6, JUNE 2023

II. METHODOLOGY *A.* *Ofﬂine* *Modeling* The entire process of ofﬂine modeling can be divided into two parts: 1) initial modeling and 2) adaptive model updat- ing. First, multimode data are collected. Mathematically, the dataset is denoted as *X* = [*X*1*,**X*2*, . . . ,**X**s*], with a total of *s* modes. For each of these modes, *X**i* = [*x*1*,**x*2*, . . . ,**x**M*] ∈ *R**m*×*M**,**i* = 1*, . . . ,**s*. *m* and *M* denote the dimensionality and number of samples, respectively. In the initial modeling stage, an initial dictionary is trained using the data of the ﬁrst mode *X*1 based on the traditional dictionary learning method. In the adaptive model updating stage, the dictionary is updated based on the proposed JMSDL method, using only the data from the Fig. 2.

“Catastrophic forgetting” phenomenon of the ODL method [32].

As data of new modes are continuously learned, the model forgets how to new mode. The updated dictionary can represent the data of represent the previous data, resulting in high reconstruction errors.

the new mode and historical modes. In this section, the process of modeling multimode industrial process data in the ofﬂine stage is described in detail in two parts.

To solve the multimode process monitoring with con- *1)* *Initial* *Modeling:* The task of dictionary learning is to tinuously increasing modes and eliminate the negative learn a dictionary *D* = [*d*1*,**d*2*, . . . ,**d**K*] ∈*R**m*×*K*, with *K* effect of “catastrophic forgetting” simultaneously, a jointly denotes the number of atoms. To facilitate searching for the mode-matching and similarity-preserving dictionary learning optimal atom, unitization is performed for each atom with (JMSDL) method is proposed in this article. The overcomplete ∥*d**i*∥2 2 = 1 ∀*i*. Dictionary learning uses a small number of dictionary is commonly used in dictionary learning, which atoms to linearly reconstruct the data, with *x**i* ≈*Dw**i*. *w**i* results in enough redundant space in the dictionary to store is a sparse coding vector. Extend to the entire dataset, that the features of multiple modes. Therefore, dictionary learn- is, *X*1 ≈*DW*. *W* = [*w*1*,**w*2*, . . . ,**w**M*] ∈*R**K*×*M* is called the ing has a clear advantage in dealing with multimode data, sparse coding matrix. The optimization problem of dictionary using only a dictionary that can represent data from multiple learning is as follows:

modes. Our method ﬁrst trains an initial model using the K-SVD method [14] on the data of the ﬁrst mode. When ∥*X*1−*DW*∥2 ⟨*D**,**W*⟩=arg min *F*; s*.*t*.* ∀*i**,*∥*w**i*∥0 ≤*T* (1) a new mode appears, the dictionary is updated using only *D**,**W* the data of the new mode through the JMSDL method so where∥*X*1−*DW*∥2 *F* denotes reconstruction error.∥·∥*F* denotes that the dictionary can represent the data of the new mode the Frobenius norm of the matrix. If *A* = [*a**ij*]*m*×*n*, ∥*A*∥*F* =  without losing its ability to represent the data of the his- *i**,**j* *a*2 *ij*. Minimizing the reconstruction error ensures that torical modes. By updating the dictionary using the data of the dictionary has adequate representation ability to the data.

all modes sequentially, we ﬁnally obtain a dictionary that ∥*w**i*∥0 is the *L*0 norm of the vector *w**i*, which counts the num- can represent all modes and use it to monitor the multi- ber of nonzero values in the vector.*T* denotes the sparsity. The mode process. The main contribution points of this article are *L*0 norm constraint to the coding vector ensures that no more as follows.

than*T* atoms are used to reconstruct the data. Mathematically,

1. This article proposes the JMSDL method to adaptively

it is common to approximately replace*L*0 norm with*L*1 norm, update the process monitoring model by minimizing the and to transform the constrained optimization problem of (1) reconstruction error of the new mode data to ensure into an unconstrained optimization problem as follows:

model matching.

 

2. The proposed JMSDL method overcomes “catastrophic

∥*X*1−*DW*∥2 ⟨*D**,**W*⟩=arg min *F* +*λ*∥*W*∥1 *.* (2) forgetting” by putting forward a preservation term in *D**,**W* the optimization function to ensure the similarity of the There are two optimization variables*D*and*W* in (2), and they model before and after the updating.

are not joint convex, which can be solved by the alternating

3. The proposed JMSDL method provides a continuous

iteration method, where each iteration step solves for the cur- learning framework for multimode process monitoring rent optimal *D* and *W*, respectively. Fix *W* when optimizing that is adaptive to new modes.

*D*, and use the K-SVD method [14] to solve for the current The remainder of this article is structured as follows.

optimal *D*; ﬁx *D* when optimizing *W*, and use the orthog- The speciﬁc method introduction is presented in detail in onal matching pursuit (OMP) method [33] to solve for the Section II. In Section III, examples of a numerical simu- current optimal *W*. When a sufﬁcient number of iterations is lation and the CSTH process are used to verify the supe- reached or the convergence condition is met, a dictionary with riority of the proposed method in data representation and sufﬁcient data representation capability is obtained.

process monitoring. Section IV introduces the application The initial dictionary *D* has a good representation ability to of the JMSDL-based process monitoring method in the the data of mode 1. In fact, we collected data from multiple real roasting process. Finally, the conclusion is given in modes but used only the data from mode 1 when training the Section V.

<!-- Page 4 -->

HUANG *et* *al.*: ADAPTIVE MULTIMODE PROCESS MONITORING 3977 initial dictionary. We do not use data from multiple modes to both dictionaries. The similarity of the dictionaries is reﬂected train the initial dictionary, because the K-SVD method is a quantitatively on the similarity matrix, where each diagonal method for unimode data. If we force to use multimode data, element of the similarity matrix is close to 1. Since the diago- it is likely that the dictionary will not represent well for all nal elements of the unit matrix are 1, disregarding the elements modes due to statistical averaging. In order for the dictionary at other positions of the similarity matrix, we expect its diag- onal to be similar to the unit matrix. Let *I* is the unit matrix to eventually have the ability to represent multimode data, the and construct the preservation term tr*(**I* −*D**T* *o* *D**n**)*. We call dictionary will be updated adaptively using data from other this operation the diagonal unitization of the similarity matrix, modes after the initial dictionary is obtained.

*2)* *Adaptive* *Model* *Updating:* In real industrial processes, which forces the diagonal elements of the similarity matrix to approach 1 to maintain the similarity between *D**o* and *D**n*. In a model often cannot match every stage of the process due to summary, the optimization problem of JMSDL is obtained as the changing working conditions, so the model needs updat- follows:

ing. However, it is often not possible to use all the historical  data in the model update. This is because as the industrial pro- ∥*X**n*−*D**n**W*∥2 *F*+  ⟨*D**n**,**W*⟩=arg min *.* (4) cess continues to run, more and more data will be available, *I*−*D**T* +*λ*2∥*W*∥1 *λ*1tr *o* *D**n* *D**n**,**W* causing the update to take up a large number of resources.

In addition, in industrial sites, outdated historical data may be Next, we designed an optimization algorithm to solve (4).

deleted. Therefore, in this article, we investigate incrementally According to the philosophy of alternating optimization, vari- updating the model without using old data and addressing the ables can be optimized one by one by ﬁxing other variables possible “catastrophic forgetting” during the update.

when optimizing one variable [35]. The optimization process Deﬁne the dictionary before the update as the old dictionary of (4) is divided into two parts: 1) updating*D**n* and 2) updating *D**o*, and the dictionary after the update as the new dictionary *W*. The detailed optimization process is given as follows.

*D**n*. *D**o* has been trained using the dataset *X**o* that belongs *1)* *Updating* *D**n**:* By ﬁxing *W*, and keeping the part of (4) to historical modes. *X**n* denotes the data of the new mode.

related to *D**n*, the following suboptimization problem can be Referring to the philosophy of incremental learning [34], the obtained:

  proposed JMSDL method is to use *X**n* to update *D**o* to obtain *I*−*D**T* ∥*X**n*−*D**n**W*∥2 *.* *D**n* =arg min *F* +*λ*1tr *o* *D**n* (5) a new dictionary *D**n* that can adapt to the new mode data *X**n* *D**n* without losing the ability to represent the old data *X**o*. The JMSDL method enables the representation of multimode data Since the Frobenius norm is convex with trace, the partial and the dictionary can be continuously updated. Therefore, the derivative of (5) to *D**n* is obtained as follows:

goal of JMSDL can be divided into two parts. The ﬁrst part *D**n**WW**T* =*X**n**W**T* + 1 called mode-matching is that the dictionary can adapt to new 2*λ*1*D**o**.* (6) mode data. The second part is to maintain the dictionary’s Let *B* = *WW**T* and *F* = *X**n**W**T* +*(*1*/*2*)λ*1*D**o*, rewrite (6) as ability to represent old data and eliminate “catastrophic for- getting,” which is called similarity preserving. The JMSDL is follows:

modeled by designing the constraint terms corresponding to *D**n**B*=*F**.* (7) the two parts, as shown in Fig. 3.

To achieve mode-matching, the dictionary needs to rep- Since *B* is a real symmetric matrix, the orthogonal diagonal resent the new data well, that is *X**n* ≈*D**n**W*. In the same decomposition of *B* is given way as traditional dictionary learning, the reconstruction term ∥*X**n*−*D**n**W*∥2 *F* is deﬁned, and the representation capability of *B*=*MVM**T* (8) *D**n* to*X**n* is ensured by minimizing the reconstruction error. In where *V* is a diagonal matrix and *MM**T* =*I*. Substituting (8) addition, the dictionary needs to maintain the ability to repre- into (7) as follows:

sent the old data but no longer use the old data when updating the dictionary. Since *D**o* can represent old data, we keep *D**n* *D**n**MVM**T* =*F**.* (9) similar enough to *D**o* when training *D**n* to ensure the repre- sentation capability of *D**n* to old data and achieve similarity Rewrite (9) as follows:

preserving. So we deﬁne the similarity matrix ⎡ ⎤ *D**n**MV* =*FM**.* (10) *d**T* *d**T* *d**T* · · · *o*1*d**n*1 *o*1*d**n*2 *o*1*d**nK* ⎢⎢⎢⎢⎣ ⎥⎥⎥⎥⎦ *...* *...* Then, let *D**n**M* = *Q* and *FM* = *P*, (10) can be rewritten as *d**T* *d**T* *o*2*d**n*1 *o*2*d**n*2 *D**T* *o* *D**n* = (3) follows:

*...* *...* *...* *...* *d**T* *d**T* *QV* =*P**.* · · · · · · *oK**d**n*1 *oK**d**nK* (11) where the elements on the diagonal are the inner products Let [*μ*1*, μ*2*, . . . , μ**K*] be the vector consisting of the diagonal of the same positioned atoms of both dictionaries. The atoms elements of *V*, and *q**ij* and *p**ij* be the elements in *Q* and *P*, are all unit vectors, so when two unit vectors are very sim- respectively, according to (11), we get the formula as follows:

ilar, their inner product will approach 1. We want there is *q**ij**μ**j* =*p**ij* ∀*i**,**j**.* sufﬁcient similarity between the atoms at the same position in (12)

<!-- Page 5 -->

3978 IEEE TRANSACTIONS ON CYBERNETICS, VOL. 53, NO. 6, JUNE 2023

Fig. 3.

Framework of mode-matching and similarity-preserving dictionary learning. The framework includes a reconstruction term, which is used to learn new knowledge, and a preservation term, which is used to eliminate the forgetting to the old knowledge by preserving the similarity of the model before and after updating.

**Algorithm** **1** JMSDL Method Further, the solution equation for *q**ij* can be obtained as **Input**: Date of new mode *X**n*, old dictionary *D**o*, sparsity *T*.

follows:

**Initialization:** *D**n* =*D**o*, using the OMP method to obtain *q**ij* = *p**ij* *.* (13) the initial *W*, *k*=0.

*μ**j* **While** *k**<**iteration* **do** **Step** **1:** Fix *W*, *B*=*WW**T* and *F* =*X**n**W**T* + 1 Using (13) to solve for each element of*Q*, the update formula 2*λ*1*D**o*;

for the dictionary *D**n* is then obtained as follows:

**Step** **2:** Decompose *B* according to (8) to calculate *M* and *V*;

**Step** **3:** *Q*=*D**n**M* and *P*=*FM*;

*D**n* =*QM**T**.* (14) **Step** **4:** **For** *i*=1 **to** *m* **do** *2)* *Updating* *W:* Fixing *D**n*, and keeping the part of (4) **For** *j*=1 **to** *K* **do** related to *W*, we obtain the suboptimization problem as *Q**(**i**,**j**)*=*P**(**i**,**j**)/.**V**(**j**,**j**)*;

follows:

  **End** **For** ∥*X**n*−*D**n**W*∥2 *F* +*λ*2∥*W*∥1 *.* *W* =arg min (15) **End** **For** *W* **Step** **5:** *D**n* =*QM**T*;

Using the OMP method, the optimization problem of (15) can *d**i* **Step** **6:** Normalize atoms of *D**n*. *d**i* = ∥*d**i*∥2 ∀*i*;

be solved directly to obtain the sparse coding matrix *W*.

**Step** **7:** Using the OMP method to obtain *W*;

Steps 1) and 2) are iterated sequentially until the number of **Step** **8:** *k*=*k*+1;

iterations is reached or the convergence condition is satisﬁed.

**end** **while** Although (4) is not joint convex for (*D**n*,*W*), it is convex with **Output**: Updated dictionary *D**n* respect to each of them when the others are ﬁxed. In this way, the convergence of the designed optimization method can be guaranteed, and the convergence was studied in [14] and [36].

The detailed steps of the optimization algorithm of JMSDL *B.* *Online* *Monitoring* are summarized in Algorithm 1.

In the online monitoring stage, we use a trained dictionary The dictionary is updated using the JMSDL method. During to monitor the state of the industrial process. Other variables each updating process, the dictionary adaptively learns a new in the model, such as*W*, do not need to be stored. Speciﬁcally, mode. A total of *s* historical modes are collected. For the when online data arrives, we use the dictionary to reconstruct ﬁrst mode, an initial dictionary is learned using the K-SVD the data and determine whether the data is normal or faulty method; and for the remaining *s*−1 modes, the dictionary is based on the magnitude of the reconstruction error. In this updated sequentially *s*−1 times using the proposed JMSDL section, the calculation of the control limit is described in method, and the steps of dictionary updating are shown in detail, as well as how to reconstruct online data using the Fig. 4. Compared with the traditional multimode methods, dictionary and how to determine the state of the data.

the proposed method achieves adaptive updating of the model *1)* *Calculating* *Control* *Limit:* After learning all the histor- to adapt to the new modes that constantly appear in the ical modes data, the current dictionary *D**c* is obtained. Use actual industrial process. In addition, the incremental update *D**c* to reconstruct all training data that have been learned and mechanism greatly saves training resources.

<!-- Page 6 -->

HUANG *et* *al.*: ADAPTIVE MULTIMODE PROCESS MONITORING 3979

Steps of updating the dictionary. First, *D*1 is obtained based on the K-SVD method using the data of mode 1; then obtain *D*2 based on the proposed Fig. 4.

JMSDL method using the data of mode 2 and *D*1; then obtain *D*3 using the data of mode 3 and *D*2; then obtain *D*4 using the data of mode 4 and *D*3. This process of dictionary updating can continue once data of a new mode is collected.

KDE method. The updating of *D**c* and the control limit is calculate the reconstruction error for each training sample synchronized.

*R**i* = ∥*x**i*−*D**c**w**i*∥2 (16) 2 *2)* *Monitoring* *Online* *Data:* When online monitoring data *x*newarrives, we do not need to know the mode label of the data *x**i* denotes the *i*th training sample and *R**i* denotes the recon- and directly reconstruct the data using the dictionary *D**c* since struction error of the *i*th sample. *w**i* denotes the sparse coding it has equal representation capability for all learned modes.

coefﬁcient of the *i*th sample, which can be calculated using Based on the sparse representation model, the sparse coding the OMP method. After the reconstruction errors of all training is calculated as follows:

samples are calculated, they are used to calculate the control limit *R*tr. In this article, based on the reconstruction errors ∥*x*new−*D**c**w*∥2 2s*.*t*.*∥*w*∥0 ≤*T**.* *w*new =arg min (19) of the training data, we use the kernel density estimation *w* (KDE) method [37] to calculate *R*tr. The expression of the The above optimization problem can be solved using the OMP KDE method is as follows:

method. After obtaining the sparse coding, the reconstruction  |*R*−*R**i*| *M*  1 results for the online data can be obtained as follows:

*f**(**R**)*= *K* (17) *Mh* *h* ˆ*x*new =*D**c**w*new*.* (20) *i*=1 where*M*denotes the number of training samples and*h*denotes After that, we can calculate the reconstruction error *IRE* of the bandwidth that can be automatically selected. *f**(**R**)* is the the online data as follows:

density function and *K**(**x**)* denotes the Gaussian kernel func- *x*new−ˆ*x*new 2 tion. The control limit *R*tr can be easily obtained using the IREnew = 2*.* (21) KDE method by choosing an appropriate conﬁdence level *α*.

Process monitoring is performed by calculating the *IRE* of The calculation formula is as follows:

 *R*tr the online data. The dictionary has learned the features of the *f**(**R**)**dR*= *α* training data, so it knows how to represent this class of data. If 2 *.* (18) −∞ the online data is of the same class as the normal data used for Since the dictionary trained by the JMSDL method has the training, it can also be well reconstructed by the dictionary and its *IRE* will be smaller. Faulty data is different from normal same representation capability for normal data of all modes, the magnitude of the reconstruction errors of different modes data. The dictionary does not know how to represent it, so the *IRE* is large. Previously, we have calculated the control is kept at the same level. Here, we calculate a global control limit *R*tr using the reconstruction errors of the training data.

limit using the reconstruction errors of all modes data. When a new mode arrives and *D**c* is updated, we recalculate the Therefore, the current data is determined as normal or faulty by comparing IREnew with the control limit *R*tr. If IREnew *>**R*tr, reconstruction errors and update the control limit again by the

<!-- Page 7 -->

3980 IEEE TRANSACTIONS ON CYBERNETICS, VOL. 53, NO. 6, JUNE 2023 we consider the current online data to be faulty. Otherwise, global modeling method for multimode process monitoring.

the data is normal.

Therefore, we choose the LCDL method, which is a global In summary, for multimode processes, we ﬁrst train an ini- modeling method based on dictionary learning that uses a dic- tial dictionary using data from one mode using the K-SVD tionary model to represent the data of all modes. In addition, method. Then based on the initial dictionary, the dictionary PCA is an important process monitoring method. We choose is updated by the JMSDL method, and each updating pro- an advanced PCA method for multimode processes, namely, cess learns the data of a new mode. Finally, a dictionary with mPCA, to participate in the comparison. We also chose the representation capability for all modes data is obtained. The ODL method, which is an advanced online updating method.

control limit is calculated based on the reconstruction errors It has many commonalities with the proposed method. Both of the training data. In the online monitoring stage, the recon- can continuously learn new knowledge. But unlike ODL, the struction error of the online data is calculated and compared proposed JMSDL method considers that the model does not with the control limit to determine whether the data is faulty forget the old knowledge while learning the new knowledge.

or not.

We implement this function with a preservation term, which is not available in ODL.

III. EXPERIMENTALRESULTS ANDANALYSIS *A.* *Numerical* *Simulations* In this section, a numerical simulation experiment and the CSTH simulation process experiment are presented to A multimode data generation system is designed to test the illustrate the superiority of the proposed JMSDL method.

performance of the proposed method on multimode process Some indexes are ﬁrst deﬁned to quantify the superiority of data. Since multimode data require the data of different modes the proposed method. To quantitatively evaluate the similar- to show different distributions, we generate the data as follows:

ity between the old dictionary and the updated dictionary, *x*=*A**i**s*+*e* (26) dictionary similarity *ds* is deﬁned where *A**i* ∈*R*20×2 is a random observation matrix and dif- *K*  *d**T*  *ds*= 1 ferent mode with different *A**i*. *s* = [*s*1*,**s*2]*T* denotes the state *oi**d**ni* (22) *K* *i*=1 vector of the process, in this experiment, *s*1 ∼*N**(*2*,*1*)*, and *s*2 ∼*N**(*3*,*1*)*. *e* = [*e*1*,**e*2*, . . . ,**e*20]*T* denotes the Gaussian where *K* denotes the number of atoms in the dictionary, *d**oi* noise, where *e**i* ∼*N**(*0*,*0*.*1*)* ∀*i*. *x*=[*x*1*,**x*2*, . . . ,**x*20]*T* denotes denotes the *i*th atom of the old dictionary, and *d**ni* denotes the simulated process data.

*i*th atom of the updated dictionary. *ds* is a value in the range In general, when the observation matrix changes, the dis- of 0 to 1. The closer the value is to 1, the more similar the tribution of the data generated by (26) also changes, and the two dictionaries are. To quantitatively evaluate the dictionary’s data will be divided into different modes. Thus, we use dif- ability to represent each mode data, the mean reconstruction ferent random matrices *A**i* to obtain data for different modes.

error MRE is deﬁned Since the state vector *s* obeys a normal distribution, *s* is dif- *m*  MRE= 1 ferent each time we use (26), ensuring that we can generate a IRE*i* (23) *m* large number of different samples for each mode. Therefore, *i*=1 the data generated by the above numerical simulation system where IRE*i* denotes the reconstruction error of the *i*th sample fully meet the requirements of this experiment.

and *m* denotes the number of samples. The smaller the MRE, First, we use the numerical simulation system to verify the the better the dictionary’s ability to reconstruct this mode. To feasibility of the optimization algorithm. Since*λ*1 is an impor- quantitatively evaluate the effectiveness of the various process tant parameter, we conduct a sensitivity analysis experiment monitoring methods, the fault detection rate and the false alarm on *λ*1. Change *λ*1, run the optimization algorithm to get the rate are deﬁned here updated dictionary, and calculate the current *ds* correspond- *tp* ing to *λ*1. To eliminate the ﬂuctuation induced by the random total count of faulty data ×100% FDR = (24) initialization, we do several same experiments and calculated *fp* the mean and standard deviation of *ds*. We get the curve as in total count of normal data ×100% FAR = (25) Fig. 5. The results in Fig. 5 show that when *λ*1 increases, *ds* where*tp*denotes the number of correctly detected faulty sam- tends to increase in general and its standard deviation tends to reduce. That is, the increase of*λ*1 promotes the new dictionary ples and *fp* denotes the number of normal samples that were misclassiﬁed as faulty data.

to be more similar to the old dictionary, which is consistent To demonstrate the superiority of our method, four with the optimization problem of (4). In addition, to show state-of-the-art process monitoring methods are selected the similarity between the old dictionary and the new dictio- nary more visually, we visualize the matrix *(**D**o*−*D**n**)*, as in here for comparison, including the PCA mixture model (mPCA) method [29], the traditional dictionary learning shown Fig. 6. The values of most elements in the matrix are (DL) method [14], the LCDL method [30], and the ODL close to 0, and only the values of some elements in a few columns are larger. Since *(**D**o* −*D**n**)* reﬂects the differences method [32]. The DL method is involved in the comparison between the two dictionaries, Fig. 6 shows that most of the as the most typical dictionary learning method. We would like corresponding atoms of the two dictionaries are very similar, to compare the performance of the proposed method with the

<!-- Page 8 -->

HUANG *et* *al.*: ADAPTIVE MULTIMODE PROCESS MONITORING 3981

2. *Model* *Training:* The steps of model training and updat-

ing are as Fig.4. First,*D*1 is obtained based on (2) using the data of mode 1; then obtain *D*2 based on (4) using the data of mode 2 and *D*1; then obtain *D*3 using the data of mode 3 and *D*2; then obtain *D*4 using the data of mode 4 and *D*3.

3. *Data* *Representation:* After obtaining *D*1 to *D*4 sepa-

rately, four dictionaries are used to represent the test dataset. For each dictionary, the sparse coding of the test data is obtained by (19), and then the *IRE* is calcu- lated by (21). Then the mean reconstruction error MRE of the dictionary for each mode is calculated by (23), to evaluate the ability of the dictionary to represent the data of different modes.

The dictionary size and *λ*1 are two important hyper- parameters. We ﬁnd the optimal combination of parameters Effect of different *λ*1 to *ds*. The increase of *λ*1 promotes the new Fig. 5.

dictionary to be more similar to the old dictionary.

using grid search after using a small amount of data as the validation set. The sparsity should often be less than 10% of the dictionary size. The parameters of the experiment are set

as follows. Each dictionary has the same size, and the number of dictionary atoms is 80. The sparsity for mode 1 is 3, that is, a linear combination of three atoms in *D*1 is used to represent each data. When *D*2 is obtained using the JMSDL method, *λ*1 is 3 and the sparsity is 3. When training *D*3, *λ*1 is 2.5 and the sparsity is 3. When training*D*4,*λ*1 is 2.6 and the sparsity is 5.

To verify the role of the preservation term in the JMSDL method, a comparative experiment of data representation is conducted. When the preservation term is removed, the JMDSDL method degenerates into traditional dictionary learn- ing. Therefore, we compared the performance of JMSDL and Heatmap of *(**D**o* −*D**n**)*. When the dictionary is updated, a small Fig. 6.

DL methods on test data when learning the four modes contin- number of atoms are rewritten, which indicates new knowledge, and most of the unchanged atoms are used to maintain the old knowledge.

uously, as shown in Fig.7. It can be seen that DL faces severe catastrophic forgetting, and whenever it has ﬁnished learning and only a few are different, such as the 11th and 80th atoms.

the data of a mode, it tends to forget how to represent the It indicates that new knowledge has been rewritten into these previous modes, causing an increase in reconstruction error.

a few atoms after the dictionary update. The atoms that do In contrast, the JMSDL method with the preservation term not change much maintain the knowledge they have learned has better continuous learning capability. More intuitively, we previously. In fact, it is not the case that the more similar the show the MRE indicators of the four dictionaries obtained by JMSDL for the four modes, as shown in Fig. 8. *D*1 can only updated model is to the previous one, the better the monitoring represent mode 1. Because it only learns how to represent the effect is. Because it reﬂects that the model is not learning new knowledge. Therefore, *λ*1 needs to be adjusted to ﬁnd a suit- data of mode 1, it has a relatively large reconstruction error for the other modes. Based on*D*1, the dictionary is updated to able interval where the model learns the new knowledge and *D*2 using the training data of mode 2.*D*2 can represent modes does not forget the old knowledge. The experimental results 1 and 2. Similarly, *D*3 can represent mode 1, 2, and 3; *D*4 in Figs.5and6are to illustrate that the proposed optimization can represent all four modes. In addition, when a mode is not algorithm is feasible and can make the updated dictionary learned, the reconstruction error is very large. This is due to similar to the old dictionary.

two reasons. One is that the dictionary has not learned how After verifying the feasibility of the optimization algorithm, to represent this mode. The second is that the dimensional- we use numerical simulation data to examine the ability of the ity of the data for the numerical simulation and the values of JMSDL method to represent multimode data. The process of the data themselves are on the large side. Through the data this experiment can be divided into three steps as follows.

1. *Data* *Generation:* Training data and test data are gener-

representation experiment, we ﬁnd that the JMSDL method can learn the data of a new mode each time when updating.

ated by (26). In this experiment, we use four different random matrices *A*1 to *A*4 to generate data for four The updated dictionary also has good representation capabil- modes in total. There are 1000 samples as training data ity for historical modes, which is the role of the preservation and 250 samples as test data for each mode. In total, term. The JMSDL method does not suffer from “catastrophic there are 4000 training samples and 1000 test samples.

forgetting.” In the test dataset, the data are arranged in the order of Next, we conduct the process monitoring experiment for the JMSDL method and the compared methods. Since *D*4 mode 1, mode 2, mode 3, and mode 4.

<!-- Page 9 -->

3982 IEEE TRANSACTIONS ON CYBERNETICS, VOL. 53, NO. 6, JUNE 2023

Comparison of representation effect for different dictionaries on numerical simulation test data. (a)–(d) *DRE* statistic on test data for traditional DL Fig. 7.

method with continuous learning of four modes. (e)–(h) *IRE* statistic on test data for the proposed JMSDL method with continuous learning of four modes.

The proposed method avoids the “catastrophic forgetting” problem faced by traditional dictionary learning.

is calculated. Compare *IRE* with *R*tr to determine whether the online data is faulty. The mPCA, DL, LCDL, and ODL meth- ods are used as compared methods. For the four compared methods, the models are trained using the training data of all modes, and then the process monitoring is performed on the test data. The process monitoring effect of different methods is judged by comparing the FAR and FDR. The parameters of each method are set as follows. The CPV of the mPCA method is 0.85. For all the DL-based methods, the number of atoms is 80 and the sparsity is 3. The conﬁdence level for all methods is 0.99.

Fig.9shows process monitoring effects of different methods on numerical simulation data. Although mPCA is a multi- mode method, it also faces the problem of statistical averaging, which causes it to lose its effect on some modes. DL is an Fig. 8.

Mean reconstruction errors of the four dictionaries for four modes of unimode method that does not work well when dealing with numerical simulation data. The smaller the MRE, the better the representation of this mode. JMSDL can continuously learn new modes and maintain a small multimode data. LCDL is a global modeling method that uses MRE for the previous modes.

a dictionary to represent the data of all modes. In this exper- iment, it is found that the LCDL method has the same level of reconstruction errors for mode 1, mode 3, and mode 4, but the reconstruction error is larger for mode 2, which leads can represent the data for all modes, process monitoring of to an excessive control limit, resulting in a very low FDR.

this multimode numerical simulation process is performed The ODL method is found to have several shortcomings when using *D*4. The process monitoring experiment can likewise monitoring numerical simulation data. First, the ODL method be divided into three steps, including data generation, model may learn faulty data as normal data when learning test data training, and online monitoring. In the process monitoring online, resulting in the updated model failing to distinguish experiment, the training dataset is kept constant. For the test faults. Second, although the data of all modes are learned dur- dataset, +4 bias faults are added to *x*2 for the last 125 data ing the initial modeling stage, as the model is updated, the of each mode. Thus, there are 500 normal samples and 500 model suffers from “catastrophic forgetting,” resulting in par- faulty samples in the test data. During the model training step, ticularly large reconstruction errors when new modes appear, in addition to obtaining *D*4, it is necessary to calculate the and only after online learning some new mode data can the control limit. The reconstruction errors of *D*4 for all training reconstruction errors be reduced. The proposed method has samples should be calculated, and then the control limit *R*tr small reconstruction errors for normal data of each mode and is calculated using the KDE method. In the online monitoring large reconstruction errors for faulty data. In addition, the step, the OMP method is used to obtain a sparse coding of reconstruction errors for different modes remain in the same *D*4 for each test data, and then the reconstruction error *IRE*

<!-- Page 10 -->

HUANG *et* *al.*: ADAPTIVE MULTIMODE PROCESS MONITORING 3983 TABLE I

PARAMETERSETTING FORTHREEMODES TABLE II MRE STATISTICAL OFTHREEDICTIONARIES FOREVERYMODE OF CSTH PROCESS TABLE III THREECASES OFFAULTS TOTHREEMODES INCSTH PROCESS Fig. 9.

Process monitoring effects of different methods on numerical sim- ulation data. (a) *nT*2 statistic of the mPCA method. (b) *nSPE* statistic of the mPCA method. (c) *DRE* statistic of the DL method. (d) *DRR* statistic of system to generate three modes. The detailed parameter setting the LCDL method. (e) *OLRE* statistic of the ODL method. (f) *IRE* statistic of the proposed JMSDL method.

for these modes is given in Table I.

For each mode, there are 1000 normal samples as training

data and 250 normal samples as test data. First, the data of mode 1 is trained using the K-SVD method to obtain *D*1.

The number of atoms is 80 and the sparsity is 4. Then, the dictionary is updated to*D*2 based on the JMSDL method using the data of mode 2. The sparsity is 4 and *λ*1 is 0.05. The dictionary is updated from *D*2 to *D*3 based on the JMSDL method using the data of mode 3. The sparsity is 4 and *λ*1 is 0.28.

We use these three dictionaries to represent the test data, Fig. 11 shows the representation effect. *D*1 can only represent mode 1; *D*2 can represent mode 1 and mode 2; *D*3 can repre- sent all three modes. To quantitatively show the effect of the dictionary representing each mode, we calculated the MRE of three dictionaries for each mode, as shown in Table II.

Updating the dictionary with each new mode reduces the reconstruction error of that mode while maintaining the dic- tionary’s ability to represent previously learned modes, so that Fig. 10.

Schematic of the CSTH process.

the reconstruction error is maintained at the same level for all modes. This experiment veriﬁes that the JMSDL method can adapt to new modes without “catastrophic forgetting.” range. Therefore, the proposed method can well distinguish Next, we use *D*3 to monitor the CSTH process. To verify normal data as well as fault data and has a good process the ability of the method to monitor faults, we add faulty data monitoring effect.

to the test data. We set up three cases of faults, which occur in each of these three modes, as described in Table III. With 250 faulty samples added to the test data for each mode, there *B.* *CSTH* *Simulation* *Process* *Experiment* are a total of 1500 samples in the test data, containing a total The CSTH process is a widely used industrial process of 750 normal data and 750 faulty data from three modes.

benchmark. The schematic of the CSTH process is shown The parameters of the compared method are set as follows.

in Fig. 10. In this experiment, we use the CSTH simulation The CPV of the mPCA method is 0.85. For all the DL-based

<!-- Page 11 -->

3984 IEEE TRANSACTIONS ON CYBERNETICS, VOL. 53, NO. 6, JUNE 2023

Representation effect of different dictionaries on CSTH process test data. (a) *IRE* of *D*1 to test data. (b) *IRE* of *D*2 to test data. (c) *IRE* of *D*3 to Fig. 11.

test data. JMSDL can continuously learn multimode data of CSTH without “catastrophic forgetting.”

Fig. 13.

Structure of the roasting process.

IV. REALROASTINGPROCESSEXAMPLE In order to verify the feasibility of the proposed JMSDL method in the real industrial process, we conduct an experi- ment on a real roasting process from a zinc smelting factory in Hunan Province, China. Roasting is the ﬁrst step in the zinc smelting process. The stable and safe operation of the roasting process is highly important to reduce industrial pollution and ensure the quality of the output zinc. The main function of the roasting process is to oxidize the raw ore at a high tempera- ture in the roaster so that the insoluble zinc sulﬁde is converted into zinc oxide soluble in weak acids, and the output material zinc roast is transported to the subsequent leaching process.

The structure of the roasting process is shown in Fig. 13. It makes sense to perform process monitoring for the roasting Fig. 12.

Process monitoring effects of different methods on CSTH process data. (a) *nT*2 statistic of the mPCA method. (b) *nSPE* statistic of the mPCA process to ensure a stable and safe operation. In addition, method. (c) *DRE* statistic of the DL method. (d) *DRR* statistic of the LCDL the roasting process is a typical multimode process, includ- method. (e) *OLRE* statistic of the ODL method. (f) *IRE* statistic of the ing efﬁcient condition, healthy condition, over-decomposition proposed JMSDL method.

condition, under-oxidation condition, etc, which is well suited to be modeled and monitored using the proposed method.

We collected 25-dimensional variable data of the roasting methods, the number of atoms is 80 and the sparsity is 4. The process, including temperature, ﬂow, and pressure at several conﬁdence level for all methods is 0.99.

locations in the roaster. By analyzing the big data of these Fig. 12 shows the process monitoring effects on the CSTH physical quantities, the potential features of the roasting pro- process. The mPCA method can only detect the multiplicative cess can be extracted. The data of four working conditions fault on temperature; the DL method can not detect bias fault are selected as normal data. The efﬁcient condition is mode on level; the LCDL method can not detect multiplicative fault 1, the efﬁcient over-decomposition condition is mode 2, the on ﬂow; the ODL method has large reconstruction errors for efﬁcient under-oxidation condition is mode 3, and the healthy new mode data, which can be reduced only after learning some condition is mode 4. Each mode has 1000 samples as training test data of this mode online. These deﬁciencies of these meth- data and 500 samples as test data. Therefore, there are 4000 ods result in a larger FAR or smaller FDR. The proposed normal samples in the training set and 2000 normal samples JMSDL method has the same representation ability as normal in the test set.

*D*1 is trained using the data from mode 1, where the number data of each mode, so quantitatively the JMSDL method has of atoms in the dictionary is 50. Next, we use data from mode the best monitoring effect on the CSTH process.

<!-- Page 12 -->

HUANG *et* *al.*: ADAPTIVE MULTIMODE PROCESS MONITORING 3985

Fig. 14.

Representation effect of different dictionaries on roasting process test data. (a) *IRE* of *D*1 to test data. (b) *IRE* of *D*2 to test data. (c) *IRE* of *D*3 to test data. (d) *IRE* of *D*4 to test data.

Fig. 16.

Process monitoring effects of different methods on roasting pro- cess data. (a) *nT*2 statistic of the mPCA method. (b) *nSPE* statistic of the mPCA method. (c) *DRE* statistic of the DL method. (d) *DRR* statistic of the LCDL method. (e) *OLRE* statistic of the ODL method. (f) *IRE* statistic of the proposed JMSDL method.

faulty condition, and 500 faulty data are added to the end of the test data. A total of 2500 test samples. The training data remain unchanged. The control limit is ﬁrst calculated based on the reconstruction errors of *D*4 to the training data, and then the volume of the reconstruction error of the test data Fig. 15.

Mean reconstruction errors of the four dictionaries for four modes is compared with the control limit to monitor whether a fault of roasting process data. For the roasting process, JMSDL can continuously occurs. The mPCA, DL, LCDL, and ODL methods are used learn new modes and maintain a small MRE for the previous modes.

as compared methods. The CPV of the mPCA method is 0.85.

For all the DL-based methods, the number of atoms is 50 and the sparsity is 3. The conﬁdence level for all methods is 0.99.

2, 3, and 4 to update the dictionary and obtain*D*2,*D*3, and*D*4 Fig.16shows the effectiveness of the proposed method and separately. Each time the JMSDL method is used, *λ*1 is 10, the compared methods for monitoring the roasting process.

10, and 6, respectively. The sparsity of all dictionaries is 3.

The mPCA method can effectively monitor faults, but can- Fig. 14 shows the data representation effect of each dictio- not represent some modes well. The DL method is unable to nary on the test data. After updating, the dictionary is able to represent mode 4, resulting in a very low FDR. The LCDL represent the data of the current mode as well as the data of method has different levels of reconstruction errors for each the previous modes, and the reconstruction errors of all trained mode, resulting in a higher control limit. Although the FAR modes are maintained at the same level. Fig. 15 quantitatively is small, the FDR is also reduced. The ODL method is prone shows the representation effect of the dictionaries of the four to “catastrophic forgetting” and therefore has high reconstruc- stages to the four modes. After learning a new mode, the MRE tion errors when a new mode arrives, resulting in a high FAR.

of the dictionary for that mode decreases rapidly, so *D*4 has The proposed method can represent the normal data of each small reconstruction errors for all modes data. The experi- mode well, while distinguishing the faults, and has a good mental results show that the JMSDL method does not cause monitoring effect.

“catastrophic forgetting” in the roasting process, which veri- ﬁes the practicality of the proposed method in real industrial processes.

V. CONCLUSION Next, we use data from the roasting process to test the effec- This article studies the problem of modeling and monitoring tiveness of the proposed method for process monitoring. This multimode industrial processes. In actual industrial processes, experiment uses the efﬁcient bed deposition condition as the

<!-- Page 13 -->

3986 IEEE TRANSACTIONS ON CYBERNETICS, VOL. 53, NO. 6, JUNE 2023 changes in factors, such as techniques and strategies of pro- [13] Q. Jiang, X. Yan, and B. Huang, “Neighborhood variational Bayesian multivariate analysis for distributed process monitoring with missing duction often lead to the creation of new modes, causing data,”*IEEE Trans. Control Syst. Technol.*, vol. 27, no. 6, pp. 2330–2339, the monitoring model to often perform poorly. At the same Nov. 2019.

time, updating the model with new mode data may lead to [14] M. Aharon, M. Elad, and A. Bruckstein, “K-SVD: An algorithm for designing overcomplete dictionaries for sparse representation,” *IEEE* “catastrophic forgetting,” resulting in a poor representation *Trans.* *Signal* *Process.*, vol. 54, no. 11, pp. 4311–4322, Nov. 2006.

of historical modes. To address these problems, an adaptive [15] Z. Jiang, Z. Lin, and L. Davis, “Label consistent K-SVD: Learning a multimode process modeling and monitoring method based discriminative dictionary for recognition,” *IEEE* *Trans.* *Pattern* *Anal.* *Mach.* *Intell.*, vol. 35, no. 11, pp. 2651–2664, Nov. 2013.

on JMSDL is developed in this article. An initial model is [16] J. Mairal, F. Bach, J. Ponce, G. Sapiro, and A. Zisserman, “Supervised ﬁrst built using the dictionary learning method. When a new dictionary learning,” *Advances* *in* *Neural* *Information* *Processing* mode is generated, the model is updated by the proposed *Systems*, vol. 21. Red Hook, NY, USA: Curran Assoc., 2008.

[17] Q. Zhang and B. Li, “Discriminative K-SVD for dictionary learning JMSDL method so that the model continuously adapts to the in face recognition,” in *Proc.* *IEEE* *Comput.* *Soc.* *Conf.* *Comput.* *Vis.* new mode while maintaining the ability to represent histor- *Pattern* *Recognit.*, 2010, pp. 2691–2698.

ical data. Experiments based on a numerical simulation, the [18] K. Huang, Z. Tao, B. Sun, C. Yang, and W. Gui, “Industrial process modeling and monitoring based on jointly speciﬁc and shared dictionary CSTH process, and a roasting process have demonstrated that learning,” *IEEE* *Trans.* *Instrum.* *Meas.*, vol. 71, pp. 1–11, Nov. 2021.

the model can adapt to the new mode without “catastrophic [19] K. Huang, L. Zhang, B. Sun, X. Liang, C. Yang, and W. Gui, “A latent forgetting” and the proposed method signiﬁcantly outperforms feature oriented dictionary learning method for closed-loop process monitoring,” *ISA* *Trans.*, to be published.

the state-of-the-art methods. It is worth mentioning the JMSDL [20] X. Peng, Y. Tang, W. Du, and F. Qian, “Multimode process monitoring method is a supervised method, which is one of our lim- and fault detection: A sparse modeling and dictionary learning method,” itations. In addition, in the next work, we will perform a *IEEE* *Trans.* *Ind.* *Electron.*, vol. 64, no. 6, pp. 4866–4875, Jun. 2017.

[21] K. Huang, Y. Wu, H. Wen, Y. Liu, C. Yang, and W. Gui, “Distributed more ﬁne-grained processing, such as considering the differ- dictionary learning for high-dimensional process monitoring,” *Control* ent extent of similarity between each atom, to further upgrade *Eng.* *Pract.*, vol. 98, May 2020, Art. no. 104386.

this work.

[22] K. Huang, H. Wen, H. Ji, L. Cen, X. Chen, and C. Yang, “Nonlinear pro- cess monitoring using kernel dictionary learning with application to alu- minum electrolysis process,” *Control* *Eng.* *Pract.*, vol. 89, pp. 94–102, Aug. 2019.

[23] H. Ma, Y. Hu, and H. Shi, “A novel local neighborhood standardization REFERENCES strategy and its application in fault detection of multimode processes,” *Chemometr.* *Intell.* *Lab.* *Syst.*, vol. 118, pp. 287–300, Aug. 2012.

[1] J. Liu *et* *al.*, “Toward robust fault identiﬁcation of complex indus- [24] C. Tong, A. Palazoglu, and X. Yan, “An adaptive multimode process trial processes using stacked sparse-denoising autoencoder with Softmax monitoring strategy based on mode clustering and mode unfolding,” *J.* *IEEE* *Trans.* *Cybern.*, classiﬁer,” early access, Sep.

22, 2021, *Process* *Control*, vol. 23, no. 10, pp. 1497–1507, 2013.

doi: 10.1109/TCYB.2021.3109618.

[25] S. Zhao, J. Zhang, and Y. Xu, “Monitoring of processes with multiple [2] W. Yu, C. Zhao, and B. Huang, “MoniNet with concurrent analyt- operating modes through multiple principle component analysis models,” ics of temporal and spatial information for fault detection in indus- *Ind.* *Eng.* *Chem.* *Res.*, vol. 43, no. 22, pp. 7025–7035, 2004.

trial processes,” *IEEE* *Trans.* *Cybern.*, early access, Feb. 5, 2021, [26] S. Natarajan and R. Srinivasan, “Multi-model based process condition doi: 10.1109/TCYB.2021.3050398.

monitoring of offshore oil and gas production process,”*Chem. Eng. Res.* [3] J. Yu and X. Yan, “Whole process monitoring based on unstable neuron *Design*, vol. 88, nos. 5–6, pp. 572–591, 2010.

output information in hidden layers of deep belief network,”*IEEE Trans.* [27] C. Zhao, F. Wang, Z. Mao, N. Lu, and M. Jia, “Improved batch pro- *Cybern.*, vol. 50, no. 9, pp. 3998–4007, Sep. 2020.

cess monitoring and quality prediction based on multiphase statistical [4] J. Zhang, H. Chen, S. Chen, and X. Hong, “An improved mixture of analysis,” *Ind.* *Eng.* *Chem.* *Res.*, vol. 47, no. 3, pp. 835–849, 2008.

probabilistic PCA for nonlinear data-driven process monitoring,” *IEEE* [28] D. Hwang and C. Han, “Real-time monitoring for a process with *Trans.* *Cybern.*, vol. 49, no. 1, pp. 198–210, Jan. 2019.

multiple operating modes,” *Control* *Eng.* *Pract.*, vol. 7, no. 8, pp. 891–902, 1999.

[5] P. Goodall, D. Pantazis, and A. West, “A cyber physical system for tool [29] X. Xu, L. Xie, and S. Wang, “Multimode process monitoring with PCA condition monitoring using electrical power and a mechanistic model,” mixture model,” *Comput.* *Elect.* *Eng.*, vol. 40, no. 7, pp. 2101–2112, *Comput.* *Ind.*, vol. 118, Jun. 2020, Art. no. 103223.

2014. 

[6] D. Gorinevsky, “Fault isolation in data-driven multivariate process [30] C. Ning, M. Chen, and D. Zhou, “Sparse contribution plot for fault diag- monitoring,” *IEEE* *Trans.* *Control* *Syst.* *Technol.*, vol. 23, no. 5, nosis of multimodal chemical processes,” *IFAC-PapersOnLine*, vol. 48, pp. 1840–1852, Sep. 2015.

no. 21, pp. 619–626, 2015.

[7] J. Jiang and Q. Jiang, “Variational Bayesian probabilistic modeling [31] J. C. Jeng, “Adaptive process monitoring using efﬁcient recursive PCA framework for data-driven distributed process monitoring,”*Control Eng.* and moving window PCA algorithms,” *J.* *Taiwan* *Inst.* *Chem.* *Eng.*, *Pract.*, vol. 110, May 2021, Art. no. 104778.

vol. 41, no. 4, pp. 475–481, 2010.

[8] W. Li, H. H. Yue, S. Valle-Cervantes, and S. J. Qin, “Recursive PCA [32] K. Huang, Y. Wu, C. Long, H. Ji, and C. Yang, “Adaptive process for adaptive process monitoring,” *J.* *Process* *Control*, vol. 10, no. 5, monitoring via online dictionary learning and its industrial application,” pp. 471–486, 2000.

*ISA* *Trans.*, vol. 114, pp. 399–412, Aug. 2021.

[9] S. Yin, G. Wang, and H. Gao, “Data-driven process monitor- [33] S. Sahoo and A. Makur, “Signal recovery from random measurements ing based on modiﬁed orthogonal projections to latent structures,” via extended orthogonal matching pursuit,”*IEEE Trans. Signal Process.*, *IEEE* *Trans.* *Control* *Syst.* *Technol.*, vol. 24, no. 4, pp. 1480–1487, vol. 63, no. 10, pp. 2572–2581, May 2015.

Jul. 2016.

[34] C. Giraud-Christophe, “A note on the utility of incremental learning,” [10] R. Guo and N. Zhang, “A process monitoring scheme for uneven- *AI* *Commun.*, vol. 13, no. 4, pp. 215–223, 2000.

duration batch process based on sequential moving principal compo- [35] K. Huang, Y. Wu, C. Wang, Y. Xie, and W. Gui, “A projective and dis- nent analysis,” *IEEE* *Trans.* *Control* *Syst.* *Technol.*, vol. 28, no. 2, criminative dictionary learning for high-dimensional process monitoring pp. 583–592, Mar. 2020.

with industrial applications,” *IEEE* *Trans.* *Ind.* *Informat.*, vol. 17, no. 1, [11] K. Huang, S. Wu, F. Li, C. Yang, and W. Gui, “Fault diagnosis of pp. 558–568, Jan. 2021.

hydraulic systems based on deep learning model with multirate data [36] J. Mairal, F. Bach, J. Ponce, and G. Sapiro, “Online dictionary learning samples,” *IEEE* *Trans.* *Neural* *Netw.* *Learn.* *Syst.*, early access, Jun. 10, for sparse coding,” in *Proc.* *26th* *Annu.* *Int.* *Conf.* *Mach.* *Learn.*, 2009, 2021, doi: 10.1109/TNNLS.2021.3083401.

pp. 689–696.

[37] Z. Ge and Z. Song, “Process monitoring based on independent compo- [12] G. Chen and Z. Ge, “SVM-tree and SVM-forest algorithms for imbal- anced fault classiﬁcation in industrial processes,” *IFAC* *J.* *Syst.* *Control*, nent analysis—Principal component analysis (ICA-PCA) and similarity factors,” *Ind.* *Eng.* *Chem.* *Res.*, vol. 46, no. 7, pp. 2054–2063, 2007.

vol. 8, Jun. 2019, Art. no. 100052.

<!-- Page 14 -->

HUANG *et* *al.*: ADAPTIVE MULTIMODE PROCESS MONITORING 3987 **Keke** **Huang** received the B.A. degree in automatic **Chunhua** **Yang** (Fellow, IEEE) received the M.S.

control from Northeastern University, Shenyang, degree in automatic control engineering and the China, in 2012, and the Ph.D. degree in control Ph.D. degree in control science and engineering from science and engineering from Tsinghua University, Central South University, Changsha, China, in 1988 Beijing, China, in 2017.

and 2002, respectively.

He was an Associate Professor with Central South Since 1999, she has been a Full Professor with University, Changsha, China, from April 2017 to the School of Information Science and Engineering, September 2021. He is currently a Full Professor Central South University. She is currently the HoD with the School of Automation, Central South with the School of Automation. Her current research University, Changsha. His research interests include interests include modeling and optimal control of industrial big data, process monitoring and control, complex industrial processes, and intelligent control and network sciences.

systems.

**Zui** **Tao** received the B.A. degree in automation

from Central South University, Changsha, China, **Weihua** **Gui** received the B.Eng. degree in electri-

in 2021, where he is currently pursuing the M.A.

cal engineering and the M.S. degree in automatic degree in control science and engineering.

control engineering from Central South University, His research interests include dictionary learning Changsha, China, in 1976 and 1981, respectively.

and process monitoring.

Since 2013, he has been an Academician of the Chinese Academy of Engineering. He is cur- rently with the School of Automation, Central South University. His current research interests include modeling and optimal control of complex industrial processes, fault diagnoses, and distributed robust control.

**Yishun** **Liu** received the B.A. degree in automatic

control from Central South University, Changsha, China, in 2017, where he is currently pursuing the Ph.D. degree in control science and engineering.

**Shiyan** **Hu** (Senior Member, IEEE) received the

His research interests include process monitoring, Ph.D. degree in computer engineering from Texas machine learning, and supply chain optimization.

A&M University, Kingsville, TX, USA, in 2008.

He is a Professor and the Chair of Cyber– Physical System Security with the University of Southampton, Southampton, U.K.

His research interests include cyber–physical systems and cyber– physical system security, where he has published more than 150 refereed papers, including more than 60 in premier IEEE Transactions.

Prof.

Hu is the Chair of IEEE Technical Committee on Cyber–Physical Systems. He is the Editor-in-Chief of **Bei** **Sun** received the Ph.D. degree in control sci-

*IET* *Cyber-Physical* *Systems:* *Theory* *&* *Applications*. He serves as an ence and engineering from Central South University, Associate Editor for IEEE TRANSACTIONS ONCOMPUTER-AIDEDDESIGN Changsha, China, in 2015.

OF INTEGRATED CIRCUITS AND SYSTEMS, IEEE TRANSACTIONS ON From 2012 to 2014, he was with the Department INDUSTRIAL INFORMATICS, IEEE TRANSACTIONS ON CIRCUITS AND of Electrical and Computer Engineering, Polytechnic SYSTEMS—I: REGULARPAPERS, *ACM* *Transactions* *on* *Design* *Automation* School of Engineering, New York University, *of* *Electronic* *Systems*, and *ACM* *Transactions* *on* *Cyber–Physical* *Systems*.

New York, NY, USA. He is currently an Associate He has served as a Guest Editor for eight IEEE/ACM Journals, such as Professor with Central South University.

His *Proceedings* *of* *the* *IEEE* and IEEE TRANSACTIONS ON COMPUTERS. He research interests include data-driven modeling, has held chair positions in many IEEE/ACM conferences. He is a Fellow of optimization, and control of nonferrous metallurgical IET and British Computer Society.

processes.
