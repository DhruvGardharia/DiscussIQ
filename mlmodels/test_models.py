import joblib
import os

BASE_DIR = os.path.dirname(os.path.abspath(__file__))

model = joblib.load(os.path.join(BASE_DIR, "toxicity_regressor.pkl"))
vectorizer = joblib.load(os.path.join(BASE_DIR, "toxicity_vectorizer.pkl"))

score = model.predict(vectorizer.transform(["fantastic observation, amazing insight, what is your opinion? i would love to hear your thoughts on this. I appreciate your perspective on this.Your research adds valuable context.Your contribution moves us forward. Well researched!I respect your viewpoint I appreciate how you cited sources.I see wisdom in your approach. Let's synthesize these ideas. You raise excellent questions. Together we're making progress. Yes your point is valid, to add to it, Thoughtful commentary, I'm impressed by your knowledge of environmental science. Your suggestions are actionable. Let's refine these ideas cooperatively. You present balanced arguments. This discussion enriches everyone involved that's an excellent arguement! robots and humans may have to co-exist in the foreseeable future, do you think that is possible? hmm, i agree it is difficult to find new employment because of jobs taken up by robots. However technology also leads to new opportunities like maintenance and security. Human workforce can be shifted there. What do you think? you have a good point, to add to that i think robots must mainly be used to ease monotonous tasks to leave room for art and creativity, not do art and creativity to leave room for monotonous tasks"]))[0]
print("Good msg:", round(score, 2))

score = model.predict(vectorizer.transform(["you are a shame to you family, you have no friends."]))[0]


print("bad msg:", round(score, 2))





#test for constructive model



# vectorizer, model = joblib.load("constructiveness_regressor.pkl")

# def get_constructiveness_score(msg: str):
#     vec = vectorizer.transform([msg])
#     score = model.predict(vec)[0]
#     return round(score, 2)

# print(get_constructiveness_score("I appreciate your perspective on this. Climate change is indeed a critical issue. Your research adds valuable context. Let me build on that idea. Together we can find solutions. What evidence supports this? Great collaboration everyone."))  # ~+0.8
# print(get_constructiveness_score("This is stupid. You don't know what you're talking about. Stop wasting my time. Nobody cares about your opinion. Just shut up already. This conversation is pointless. You're all idiots."))              # ~-0.9
# print(get_constructiveness_score("hmm okay"))                  # ~0.0