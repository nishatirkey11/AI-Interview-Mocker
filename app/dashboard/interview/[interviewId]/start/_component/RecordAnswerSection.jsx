"use client"
import { Button } from '@/components/ui/button'
import Image from 'next/image'
import React, { useEffect, useState } from 'react'
import Webcam from 'react-webcam'
import useSpeechToText from 'react-hook-speech-to-text';
import { Mic } from 'lucide-react'
import { toast } from 'sonner'
import { chatSession } from '@/utils/GeminiAIModal'
import { UserAnswer } from '@/utils/schema'
import moment from 'moment'
import { useUser } from '@clerk/nextjs'
import { db } from '@/utils/db'

function RecordAnswerSection({mockInterviewQuestion, activeQuestionIndex, interviewData}) {
    const [userAnswer, setUserAnswer] = useState('');
    const {user}=useUser();
    const [loading,setLoading]=useState(false);
    const {
        error,
        interimResult,
        isRecording,
        results,
        startSpeechToText,
        stopSpeechToText,
      } = useSpeechToText({
        continuous: true,
        useLegacyResults: false
      });

      useEffect(()=>{
        results.map((result)=>(
            setUserAnswer(prevAns=>prevAns+result?.transcript)
        ))
      },[results])

      useEffect(()=>{
        if(!isRecording&&userAnswer.length>10)
        {
          UpdateUserAnswer();
        }
      },[userAnswer])

      const StartStopRecording= async ()=>{
        if(isRecording) {
          stopSpeechToText();
          // console.log(userAnswer)
          // if(userAnswer?.length<10) {
          //   setLoading(false);
          //   toast('Error while saving your answer, Please record again');
          //   return ;
          // }
        }
        else {
          startSpeechToText();
        }
      }

      const UpdateUserAnswer=async()=>{
        console.log(userAnswer);
        setLoading(true);
        
        const feedbackPrompt="Question:"+mockInterviewQuestion[activeQuestionIndex]?.question+
            ", User Answer:"+userAnswer+",Depends on question and user answer for given interview Question "+
            " please give us rating for answer and feedback as area of improvment if any "+
            "in just 3 to 5 lines to improve it in JSON format with rating field and feedback field";

            const result= await chatSession.sendMessage(feedbackPrompt);

            const mockJsonResp=(result.response.text()).replace('```json','').replace('```','');
            console.log(mockJsonResp);
            const JsonFeedbackResp=JSON.parse(mockJsonResp);

            const resp=await db.insert(UserAnswer)
            .values({
              mockIdRef:interviewData?.mockId,
              question:mockInterviewQuestion[activeQuestionIndex]?.question,
              correctAns:mockInterviewQuestion[activeQuestionIndex]?.answer,
              userAns:userAnswer,
              feedback:JsonFeedbackResp?.feedback,
              rating:JsonFeedbackResp?.rating,
              userEmail:user?.primaryEmailAddress?.emailAddress,
              createdAt:moment().format('DD-MM-YYYY'),
            }) 

            if(resp) 
            {
              toast('User Answer recorded successfully')
            }
            setUserAnswer('');
            setLoading(false);

      }

  return (
    <div className='flex flex-col items-center justify-center'>
    <div className='flex flex-col my-20 justify-center items-center bg-black rounded-lg p-5'>
        <Image src={'/webcam.png'} width={150} height={150} alt = 'webcam placeholder' priority
        className='absolute'/>
        <Webcam
        mirrored={true}
        style={{
            height: 300,
            width: '100%',
            zIndex: 10,
        }}
        />
    </div>
    <Button 
    disabled={loading}
    variant="outline" className="my-10"
    onClick={StartStopRecording}
    >
        {isRecording?
        <h2 className='text-red-600 flex gap-2'>
            <Mic/> Stop Recording
        </h2>
        : 'Record Your Answer'
        }
    </Button>

    
    </div>
  )
}

export default RecordAnswerSection